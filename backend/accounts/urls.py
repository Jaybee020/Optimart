from django.urls import path

from .views import AccountActivityAPIView, AccountAPIView, CreateAccountAPIView

urlpatterns = [
    path('accounts', CreateAccountAPIView.as_view(), name='create-account'),
    path('accounts/activity', AccountActivityAPIView.as_view(), name='account-activity'),
    path('accounts/<str:address>', AccountAPIView.as_view(), name='get-update-account'),
]
