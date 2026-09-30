import unittest
from app import app
class SentimentTests(unittest.TestCase):
    def test_polarities(self):
        client=app.test_client()
        for text,expected in [('Fantastic services','positive'),('Terrible service, I hate it','negative'),('The car is parked','neutral')]:
            with self.subTest(text=text):
                self.assertEqual(client.get('/analyze/'+text).json['sentiment'],expected)
if __name__=='__main__':
    unittest.main()
