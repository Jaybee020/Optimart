from django.urls import path

from .views import AccountActivityAPIView

urlpatterns = [
    path('accounts/activity', AccountActivityAPIView.as_view(), name='account-activity'),
]
