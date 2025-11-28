from django.shortcuts import render, redirect
from django.http import Http404
from django.views import View
from .forms import TimelineForm
from .models import TimelineEntry  # Import your model instead of supabase

class TimelineAppView(View):
    template_name = 'timeline_app/timeline_app.html'

    def get(self, request):
        return render(request, self.template_name)

#############################################
# VIEW: List all timeline entries - CONVERTED
#############################################
def timeline_list(request):
    # REPLACED: supabase.table("timeline").select("*").order("date").execute()
    # WITH: Simple Django ORM query
    entries = TimelineEntry.objects.all()
    # The ordering is already handled by class Meta in models.py

    return render(request, "timeline_app/timeline_app.html", {"entries": entries})


#############################################
# VIEW: Create new timeline entry - CONVERTED
#############################################
def timeline_create(request):
    if request.method == "POST":
        form = TimelineForm(request.POST)

        if form.is_valid():
            # REPLACED: supabase insert with Django ORM create
            TimelineEntry.objects.create(
                title=form.cleaned_data["title"],
                description=form.cleaned_data["description"],
                date=form.cleaned_data["date"]
                # No need for .isoformat() - Django handles dates automatically
            )

            return redirect("timeline_list")

    else:
        form = TimelineForm()

    return render(request, "timeline/create.html", {"form": form})


#############################################
# VIEW: Edit a timeline entry - CONVERTED
#############################################
def timeline_edit(request, timeline_id):
    # REPLACED: supabase fetch with Django ORM get
    try:
        entry = TimelineEntry.objects.get(id=timeline_id)
    except TimelineEntry.DoesNotExist:
        raise Http404("Entry not found")

    if request.method == "POST":
        form = TimelineForm(request.POST)

        if form.is_valid():
            # REPLACED: supabase update with Django ORM save
            entry.title = form.cleaned_data["title"]
            entry.description = form.cleaned_data["description"]
            entry.date = form.cleaned_data["date"]
            entry.save()  # This updates the existing entry

            return redirect("timeline_list")

    else:
        form = TimelineForm(initial={
            "title": entry.title,  # Changed from entry["title"] to entry.title
            "description": entry.description,
            "date": entry.date,
        })

    return render(request, "timeline/edit.html", {"form": form, "entry": entry})


#############################################
# VIEW: Delete a timeline entry - CONVERTED
#############################################
def timeline_delete(request, timeline_id):
    # REPLACED: supabase fetch with Django ORM get
    try:
        entry = TimelineEntry.objects.get(id=timeline_id)
    except TimelineEntry.DoesNotExist:
        raise Http404("Entry not found")

    if request.method == "POST":
        # REPLACED: supabase delete with Django ORM delete
        entry.delete()
        return redirect("timeline_list")

    return render(request, "timeline/delete.html", {"entry": entry})