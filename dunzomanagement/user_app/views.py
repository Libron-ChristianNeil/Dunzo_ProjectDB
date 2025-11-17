from django.shortcuts import render
from django.views import View


# def user_dashboard(request):
#     return render(request, 'user_app/user_dashboard.html')
#
# def edit_profile(request):
#     return render(request, 'user_app/edit_profile.html')
#
# def view_notifications(request):
#     return render(request, 'user_app/view_notifications.html')


class DashboardView(View):
    template_name = 'user_app/user_dashboard.html'
    def get(self, request):
        return render(request, self.template_name)

class EditProfileView(View):
    template_name = 'user_app/edit_profile.html'
    def get(self, request):
        return render(request, self.template_name)

class ViewNotificationsView(View):
    template_name = 'user_app/view_notifications.html'
    def get(self, request):
        return render(request, self.template_name)

class LoginView(View):
    template_name = 'user_app/login.html'
    def get(self, request):
        return render(request, self.template_name)

class SettingsView(View):
    template_name = 'user_app/settings.html'
    def get(self, request):
        return render(request, self.template_name)

