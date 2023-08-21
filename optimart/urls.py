"""
URL configuration for the optimart project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import: from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import: from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from drf_yasg import openapi
from drf_yasg.views import get_schema_view

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

from rest_framework import permissions, status

schema_view = get_schema_view(
    openapi.Info(
        title='Optimart API',
        default_version='v1',
        description='Optimart API',
        license=openapi.License(name='MIT License'),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


def handle_500(request):  # noqa: ARG001
    return JsonResponse(
        data={'detail': "We're sorry, but something went wrong on our end"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def handle_404(request, exception):  # noqa: ARG001
    return JsonResponse(
        data={'detail': 'Not found'},
        status=status.HTTP_404_NOT_FOUND,
    )


handler500 = handle_500

handler404 = handle_404

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('listings.urls')),
    path('api/', include('collection.urls')),
    path('api/', include('accounts.urls')),
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
