"""planets URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
import page.views
import planetor.views

urlpatterns = [
    path('', page.views.home, name='home'),
    path('about', planetor.views.about, name='about'),
    path('admin/', admin.site.urls),
    path('claimplanet/', planetor.views.claimplanet, name='claimplanet'),
    path('dirlist', planetor.views.dirlist, name='dirlist'),
    path('editplanet/', planetor.views.editplanet, name='editplanet'),
    path('collection/', planetor.views.collection, name='collection'),
    path('exchange', planetor.views.exchange, name='exchange'),
    path('gallery', planetor.views.gallery, name='gallery'),
    path('randomgallery', planetor.views.randomgallery, name='randomgallery'),
    path('generate_planet', planetor.views.generate_planet, name='generate_planet'),
    path('regenerate_planet', planetor.views.regenerate_planet, name='regenerate_planet'),
    path('generateplanet/', planetor.views.generateplanet, name='generateplanet'),
    path('mygallery', planetor.views.mygallery, name='mygallery'),
    path('allgallery', planetor.views.allgallery, name='allgallery'),
    path('screensaver', planetor.views.screensaver, name='screensaver'),
    path('browseplanets', planetor.views.browseplanets, name='browseplanets'),
    path('myplanets/', planetor.views.myplanets, name='myplanets'),
    path('preview_planet', planetor.views.preview_planet, name='preview_planet'),
    path('randomfile', planetor.views.randomfile, name='randomfile'),
    path('dbdelete', planetor.views.dbdelete, name='dbdelete'),
    path('dbupdate', planetor.views.dbupdate, name='dbupdate'),
    path('dbread', planetor.views.dbread, name='dbread'),
    path('editspecs', planetor.views.editspecs, name='editspecs'),
    path('images', planetor.views.images, name='images'),
    path('generate/planetor', include('planetor.urls', namespace='planetor'))
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.MEDIA_URL_1, document_root=settings.MEDIA_ROOT_1)
urlpatterns += static(settings.MEDIA_URL_2, document_root=settings.MEDIA_ROOT_2)
urlpatterns += static(settings.MEDIA_URL_3, document_root=settings.MEDIA_ROOT_3)
urlpatterns += static(settings.MEDIA_URL_4, document_root=settings.MEDIA_ROOT_4)
urlpatterns += static(settings.MOBILE_URL, document_root=settings.MOBILE_ROOT)
urlpatterns += static(settings.WEBSITE_URL, document_root=settings.WEBSITE_ROOT)
urlpatterns += static(settings.GAME_URL, document_root=settings.GAME_ROOT)
urlpatterns += static(settings.DOCUMENTATION_URL, document_root=settings.DOCUMENTATION_ROOT)

# path('generate/build', planetor.views.build, name='build_planet' ),
