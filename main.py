# Copyright 2014 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Main package for URL routing and the index page."""

__author__ = 'Sean Lip'

import feconf

from core.controllers import admin
from core.controllers import base
from core.controllers import editor
from core.controllers import feedback
from core.controllers import galleries
from core.controllers import moderator
from core.controllers import pages
from core.controllers import profile
from core.controllers import reader
from core.controllers import recent_commits
from core.controllers import resources
from core.controllers import services
from core.controllers import widgets
from core.platform import models
transaction_services = models.Registry.import_transaction_services()

import webapp2
from webapp2_extras.routes import RedirectRoute


class Error404Handler(base.BaseHandler):
    """Handles 404 errors."""

    def get(self):
        """Raises a PageNotFoundException if an invalid URL is entered.

        For robots.txt requests, returns an empty response so that the error
        does not show up in the logs.
        """
        if not self.request.uri.endswith('robots.txt'):
            raise self.PageNotFoundException


class WarmupHandler(base.BaseHandler):
    """Handles warmup requests."""

    def get(self):
        """Handles GET warmup requests."""
        pass


# Regex for base64 id encoding
r = '[A-Za-z0-9=_-]+'


def generate_static_url_tuples():
    static_urls = []
    url_tuples = []
    for url in feconf.PATH_MAP:
        static_urls.append(url+'.+')
    for url in static_urls:
        url_tuples.append((url, resources.StaticFileHandler))
    return url_tuples


def get_redirect_route(regex_route, handler, name, defaults=None):
    """Returns a route that redirects /foo/ to /foo.

    Warning: this method strips off parameters after the trailing slash. URLs
    with parameters should be formulated without the trailing slash.
    """
    if defaults is None:
        defaults = {}
    return RedirectRoute(
        regex_route, handler, name, strict_slash=True, defaults=defaults)


# Register the URL with the responsible classes
urls = [
    get_redirect_route(r'/_ah/warmup', WarmupHandler, 'warmup_handler'),

    webapp2.Route(
        r'%s' % feconf.SPLASH_PAGE_URL, pages.SplashPage, 'splash_page'),
    get_redirect_route(r'/about', pages.AboutPage, 'about_page'),
    get_redirect_route(
        r'/site_guidelines', pages.SiteGuidelinesPage, 'site_guidelines_page'),
    get_redirect_route(r'/contact', pages.ContactPage, 'contact_page'),

    get_redirect_route(r'/admin', admin.AdminPage, 'admin_page'),
    get_redirect_route(r'/adminhandler', admin.AdminHandler, 'admin_handler'),

    get_redirect_route(
        r'/imagehandler/<exploration_id>/<encoded_filepath>',
        resources.ImageHandler, 'image_handler'),
    get_redirect_route(
        r'/object_editor_template/<obj_type>',
        resources.ObjectEditorTemplateHandler, 'object_editor_template'),
    get_redirect_route(
        r'/value_generator_handler/<generator_id>',
        resources.ValueGeneratorHandler, 'value_generator_handler'),

    get_redirect_route(
        r'%s' % feconf.LEARN_GALLERY_URL, galleries.LearnPage,
        'learn_gallery_page'),
    get_redirect_route(
        r'%s' % feconf.LEARN_GALLERY_DATA_URL, galleries.LearnHandler,
        'learn_gallery_handler'),

    get_redirect_route(
        r'%s' % feconf.PLAYTEST_QUEUE_URL, galleries.PlaytestPage,
        'playtest_queue_page'),
    get_redirect_route(
        r'%s' % feconf.PLAYTEST_QUEUE_DATA_URL, galleries.PlaytestHandler,
        'playtest_queue_handler'),

    get_redirect_route(
        r'%s' % feconf.CONTRIBUTE_GALLERY_URL, galleries.ContributePage,
        'contribute_gallery_page'),
    get_redirect_route(
        r'%s' % feconf.CONTRIBUTE_GALLERY_DATA_URL,
        galleries.ContributeHandler, 'contribute_gallery_handler'),
    get_redirect_route(
        r'%s' % feconf.NEW_EXPLORATION_URL,
        galleries.NewExploration, 'new_exploration'),
    get_redirect_route(
        r'%s' % feconf.UPLOAD_EXPLORATION_URL,
        galleries.UploadExploration, 'upload_exploration'),
    get_redirect_route(
        r'%s' % feconf.CLONE_EXPLORATION_URL,
        galleries.CloneExploration, 'clone_exploration'),

    get_redirect_route(
        r'%s' % feconf.RECENT_COMMITS_DATA_URL,
        recent_commits.RecentCommitsHandler, 'recent_commits_handler'),

    get_redirect_route(r'/profile', profile.ProfilePage, 'profile_page'),
    get_redirect_route(
        r'/profilehandler/data', profile.ProfileHandler, 'profile_handler'),
    get_redirect_route(
        r'%s' % feconf.EDITOR_PREREQUISITES_URL,
        profile.EditorPrerequisitesPage, 'editor_prerequisites_page'),
    get_redirect_route(
        r'%s' % feconf.EDITOR_PREREQUISITES_DATA_URL,
        profile.EditorPrerequisitesHandler, 'editor_prerequisites_handler'),

    get_redirect_route(
        r'/moderator', moderator.ModeratorPage, 'moderator_page'),
    get_redirect_route(
        r'/moderatorhandler/user_services',
        moderator.UserServiceHandler, 'moderator_user_service_handler'),

    get_redirect_route(
        r'%s/<exploration_id>' % feconf.EXPLORATION_URL_PREFIX,
        reader.ExplorationPage, 'exploration_page'),
    get_redirect_route(
        r'%s/<exploration_id>' % feconf.EXPLORATION_INIT_URL_PREFIX,
        reader.ExplorationHandler, 'exploration_handler'),
    get_redirect_route(
        (r'%s/<exploration_id>/<escaped_state_name>'
         % feconf.EXPLORATION_TRANSITION_URL_PREFIX),
        reader.FeedbackHandler, 'feedback_handler'),
    get_redirect_route(
        r'/explorehandler/give_feedback/<exploration_id>/<escaped_state_name>',
        reader.ReaderFeedbackHandler, 'reader_feedback_handler'),

    get_redirect_route(
        r'%s/<exploration_id>' % feconf.EDITOR_URL_PREFIX,
        editor.ExplorationPage, 'editor_exploration_page'),
    get_redirect_route(
        r'/createhandler/data/<exploration_id>', editor.ExplorationHandler,
        'editor_exploration_handler'),
    get_redirect_route(
        r'/createhandler/change_list_summary/<exploration_id>',
        editor.ChangeListSummaryHandler, 'change_list_summary'),
    get_redirect_route(
        r'/createhandler/download/<exploration_id>',
        editor.ExplorationDownloadHandler, 'exploration_download_handler'),
    get_redirect_route(
        r'/createhandler/imageupload/<exploration_id>',
        editor.ImageUploadHandler, 'image_upload_handler'),
    get_redirect_route(
        r'/createhandler/new_state_template/<exploration_id>',
        editor.NewStateTemplateHandler, 'new_state_template'),
    get_redirect_route(
        r'/createhandler/resolved_answers/<exploration_id>/<escaped_state_name>',
        editor.ResolvedAnswersHandler, 'resolved_answers_handler'),
    get_redirect_route(
        r'/createhandler/resolved_feedback/<exploration_id>/<escaped_state_name>',
        editor.ResolvedFeedbackHandler, 'resolved_feedback_handler'),
    get_redirect_route(
        r'/createhandler/resource_list/<exploration_id>',
        editor.ExplorationResourcesHandler, 'exploration_resources_handler'),
    get_redirect_route(
        r'/createhandler/revert/<exploration_id>',
        editor.ExplorationRevertHandler, 'exploration_revert_handler'),
    get_redirect_route(
        r'%s/<exploration_id>' % feconf.EXPLORATION_RIGHTS_PREFIX,
        editor.ExplorationRightsHandler, 'exploration_rights_handler'),
    get_redirect_route(
        r'/createhandler/snapshots/<exploration_id>',
        editor.ExplorationSnapshotsHandler, 'exploration_snapshots_handler'),
    get_redirect_route(
        r'/createhandler/statistics/<exploration_id>',
        editor.ExplorationStatisticsHandler, 'exploration_statistics_handler'),
    get_redirect_route(
        r'/createhandler/state_rules_stats/<exploration_id>/<escaped_state_name>',
        editor.StateRulesStatsHandler, 'state_rules_stats_handler'),

    get_redirect_route(
        r'/widgetrepository/data/<widget_type>',
        widgets.WidgetRepositoryHandler, 'widget_repository_handler'),
    get_redirect_route(
        r'/widgets/<widget_type>/<widget_id>', widgets.WidgetHandler,
        'widget_handler'),

    get_redirect_route(
        r'/filereadhandler', services.FileReadHandler, 'file_read_handler'),
]
if feconf.SHOW_FEEDBACK_TAB:
  urls += [
      get_redirect_route(
          r'%s/<exploration_id>' % feconf.THREADLIST_URL_PREFIX,
          feedback.ThreadListHandler, 'threadlist_handler'),
      get_redirect_route(
          r'%s/create/<exploration_id>' % feconf.THREADLIST_URL_PREFIX,
          feedback.ThreadCreateHandler, 'threadcreate_handler'),
      get_redirect_route(
          r'%s/<thread_id>' % feconf.THREAD_URL_PREFIX,
          feedback.ThreadHandler, 'thread_handler'),
      get_redirect_route(
          r'%s/create/<thread_id>' % feconf.THREAD_URL_PREFIX,
          feedback.MessageCreateHandler, 'messagecreate_handler'),
  ]


# 404 error handler.
error404_handler = [webapp2.Route(r'/.*', Error404Handler)]

urls = urls + error404_handler


app = transaction_services.toplevel_wrapper(
    webapp2.WSGIApplication(urls, debug=feconf.DEBUG))
