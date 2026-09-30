import json
from functools import wraps
import requests
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import CarMake, CarModel
from .restapis import get_request, post_review, analyze_review_sentiments

def upstream(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        try:
            return view(*args, **kwargs)
        except requests.RequestException:
            return JsonResponse({'status':502,'message':'A backend service is temporarily unavailable.'},status=502)
    return wrapper

@require_GET
@ensure_csrf_cookie
def session_user(request):
    return JsonResponse({'userName':request.user.username if request.user.is_authenticated else None})

@require_POST
def login_user(request):
    try:
        data=json.loads(request.body)
        user=authenticate(request,username=data.get('userName'),password=data.get('password'))
    except (ValueError,TypeError):
        return JsonResponse({'message':'Invalid JSON'},status=400)
    if user is None:
        return JsonResponse({'message':'Invalid username or password'},status=401)
    login(request,user)
    return JsonResponse({'userName':user.username,'status':'Authenticated'})

@require_POST
def logout_request(request):
    logout(request)
    return JsonResponse({'status':'Logged out'})

@require_POST
def registration(request):
    try:
        data=json.loads(request.body)
        required=['userName','firstName','lastName','email','password']
        if not all(isinstance(data.get(k),str) and data[k].strip() for k in required):
            raise ValueError('All five fields are required')
        user=User(username=data['userName'],first_name=data['firstName'],last_name=data['lastName'],email=data['email'])
        validate_password(data['password'],user)
        user.set_password(data['password'])
        user.save()
    except IntegrityError:
        return JsonResponse({'message':'Username already exists'},status=409)
    except (ValueError,ValidationError) as exc:
        return JsonResponse({'message':str(exc)},status=400)
    login(request,user)
    return JsonResponse({'userName':user.username,'status':'Authenticated'},status=201)

@require_GET
@upstream
def get_dealerships(request,state='All'):
    from urllib.parse import quote
    endpoint='fetchDealers' if state=='All' else 'fetchDealers/'+quote(state,safe='')
    return JsonResponse({'status':200,'dealers':get_request(endpoint)})

@require_GET
@upstream
def get_dealer_details(request,dealer_id):
    return JsonResponse({'status':200,'dealer':get_request(f'fetchDealer/{dealer_id}')})

@require_GET
@upstream
def get_dealer_reviews(request,dealer_id):
    reviews=get_request(f'fetchReviews/dealer/{dealer_id}')
    for review in reviews:
        review['sentiment']=analyze_review_sentiments(review['review'])['sentiment']
    return JsonResponse({'status':200,'reviews':reviews})

@require_GET
def get_cars(request):
    return JsonResponse({'status':200,'CarMakes':list(CarMake.objects.values('id','name','description')),'CarModels':[{'id':c.id,'CarMake':c.car_make.name,'CarModel':c.name,'year':c.year,'type':c.type} for c in CarModel.objects.select_related('car_make')]})

@require_POST
@upstream
def add_review(request):
    if not request.user.is_authenticated:
        return JsonResponse({'message':'Please log in'},status=401)
    try:
        data=json.loads(request.body)
        required=['dealership','review','purchase_date','car_make','car_model','car_year']
        if not all(data.get(k) for k in required) or len(data['review'])>5000:
            raise ValueError('Complete all review fields')
        data['dealership']=int(data['dealership'])
        data['car_year']=int(data['car_year'])
        if not 2015<=data['car_year']<=2035:
            raise ValueError('Invalid car year')
        data['name']=request.user.get_full_name() or request.user.username
        data['purchase']=bool(data.get('purchase',True))
    except (ValueError,TypeError):
        return JsonResponse({'message':'Invalid review details'},status=400)
    return JsonResponse({'status':200,'review':post_review(data)})
