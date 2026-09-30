import json
from unittest.mock import patch
from django.test import TestCase,Client
from django.contrib.auth.models import User
from django.core.management import call_command
from .models import CarMake,CarModel

class ApplicationTests(TestCase):
    def setUp(self):
        self.user=User.objects.create_user('driver',password='Course-Test-4821!',first_name='Demo',last_name='Driver')
    def post(self,url,data):
        return self.client.post('/djangoapp/'+url,json.dumps(data),content_type='application/json')
    def test_login_logout_session(self):
        self.assertEqual(self.post('login',{'userName':'driver','password':'wrong'}).status_code,401)
        self.assertEqual(self.post('login',{'userName':'driver','password':'Course-Test-4821!'}).json()['status'],'Authenticated')
        self.assertEqual(self.client.get('/djangoapp/session').json()['userName'],'driver')
        self.assertEqual(self.post('logout',{}).json()['status'],'Logged out')
        self.assertIsNone(self.client.get('/djangoapp/session').json()['userName'])
    def test_registration_duplicate_and_validation(self):
        data={'userName':'newdriver','firstName':'Demo','lastName':'Driver','email':'demo@example.com','password':'Course-Test-4821!'}
        self.assertEqual(self.post('register',data).status_code,201)
        self.assertEqual(self.post('register',data).status_code,409)
        self.assertEqual(self.post('register',{}).status_code,400)
    def test_csrf_required(self):
        client=Client(enforce_csrf_checks=True)
        self.assertEqual(client.post('/djangoapp/login','{}',content_type='application/json').status_code,403)
    def test_seed_is_idempotent(self):
        call_command('seed_cars'); before=CarModel.objects.count();call_command('seed_cars')
        self.assertEqual(CarModel.objects.count(),before)
        self.assertGreater(before,0)
        data=self.client.get('/djangoapp/get_cars').json()
        self.assertGreater(len(data['CarMakes']),0)
        self.assertIn('CarModel',data['CarModels'][0])
    @patch('djangoapp.views.get_request')
    def test_state_filter_proxy(self,get):
        get.return_value=[{'id':1,'state':'Kansas'}]
        self.assertEqual(self.client.get('/djangoapp/get_dealers/Kansas').json()['dealers'][0]['state'],'Kansas')
        get.assert_called_once_with('fetchDealers/Kansas')
    @patch('djangoapp.views.analyze_review_sentiments',return_value={'sentiment':'positive'})
    @patch('djangoapp.views.get_request',return_value=[{'id':1,'review':'Fantastic services'}])
    def test_review_sentiment(self,get,analyze):
        self.assertEqual(self.client.get('/djangoapp/reviews/dealer/1').json()['reviews'][0]['sentiment'],'positive')
    @patch('djangoapp.views.post_review',return_value={'id':1001})
    def test_review_requires_login_and_uses_session_name(self,post):
        data={'dealership':1,'review':'Great service','purchase_date':'2026-09-30','car_make':'Nissan','car_model':'Pathfinder','car_year':2023,'name':'Imposter'}
        self.assertEqual(self.post('add_review',data).status_code,401)
        self.client.force_login(self.user)
        self.assertEqual(self.post('add_review',data).status_code,200)
        self.assertEqual(post.call_args.args[0]['name'],'Demo Driver')
    @patch('djangoapp.views.get_request')
    def test_upstream_failure(self,get):
        import requests
        get.side_effect=requests.ConnectionError()
        self.assertEqual(self.client.get('/djangoapp/get_dealers').status_code,502)
