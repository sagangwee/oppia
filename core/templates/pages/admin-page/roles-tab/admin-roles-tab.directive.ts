// Copyright 2017 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Directive for the Roles tab in the admin panel.
 */

require('pages/admin-page/roles-tab/role-graph.directive.ts');

require('domain/utilities/language-util.service.ts');
require('domain/utilities/url-interpolation.service.ts');
require('pages/admin-page/services/admin-data.service.ts');
require('pages/admin-page/services/admin-task-manager.service.ts');

require('pages/admin-page/admin-page.constants.ajs.ts');

angular.module('oppia').directive('adminRolesTab', [
  '$http', '$rootScope', 'AdminDataService', 'AdminTaskManagerService',
  'LanguageUtilService', 'UrlInterpolationService',
  'ACTION_REMOVE_ALL_REVIEW_RIGHTS', 'ACTION_REMOVE_SPECIFIC_REVIEW_RIGHTS',
  'ADMIN_ROLE_HANDLER_URL', 'REVIEW_CATEGORY_QUESTION',
  'REVIEW_CATEGORY_TRANSLATION', 'REVIEW_CATEGORY_VOICEOVER',
  'VIEW_METHOD_ROLE', 'VIEW_METHOD_USERNAME',
  function(
      $http, $rootScope, AdminDataService, AdminTaskManagerService,
      LanguageUtilService, UrlInterpolationService,
      ACTION_REMOVE_ALL_REVIEW_RIGHTS, ACTION_REMOVE_SPECIFIC_REVIEW_RIGHTS,
      ADMIN_ROLE_HANDLER_URL, REVIEW_CATEGORY_QUESTION,
      REVIEW_CATEGORY_TRANSLATION, REVIEW_CATEGORY_VOICEOVER,
      VIEW_METHOD_ROLE, VIEW_METHOD_USERNAME,) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        setStatusMessage: '='
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/admin-page/roles-tab/role-graph.directive.html'),
      controllerAs: '$ctrl',
      controller: [function() {
        var ctrl = this;

        var handleErrorResponse = function(errorResponse) {
          ctrl.setStatusMessage(
            'Server error: ' + errorResponse.data.error);
        };

        var getLanguageDescriptions = function(languageCodes) {
          var languageDescriptions = [];
          languageCodes.forEach(function(languageCode) {
            languageDescriptions.push(
              LanguageUtilService.getAudioLanguageDescription(
                languageCode));
          });
          return languageDescriptions;
        };

        ctrl.submitRoleViewForm = function(formResponse) {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }

          ctrl.setStatusMessage('Processing query...');

          AdminTaskManagerService.startTask();
          ctrl.result = {};
          $http.get(ADMIN_ROLE_HANDLER_URL, {
            params: {
              method: formResponse.method,
              role: formResponse.role,
              username: formResponse.username
            }
          }).then(function(response) {
            ctrl.result = response.data;
            if (Object.keys(ctrl.result).length === 0) {
              ctrl.resultRolesVisible = false;
              ctrl.setStatusMessage('No results.');
            } else {
              ctrl.resultRolesVisible = true;
              ctrl.setStatusMessage('Success.');
            }
            refreshFormData();
          }, handleErrorResponse);
          AdminTaskManagerService.finishTask();
        };

        ctrl.submitUpdateRoleForm = function(formResponse) {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          ctrl.setStatusMessage('Updating User Role');
          AdminTaskManagerService.startTask();
          $http.post(ADMIN_ROLE_HANDLER_URL, {
            role: formResponse.newRole,
            username: formResponse.username,
            topic_id: formResponse.topicId
          }).then(function(response) {
            ctrl.setStatusMessage(
              'Role of ' + formResponse.username + ' successfully updated to ' +
              formResponse.newRole);
            refreshFormData();
          }, handleErrorResponse);
          AdminTaskManagerService.finishTask();
        };

        ctrl.submitAddCommunityReviewerForm = function(formResponse) {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          ctrl.setStatusMessage('Adding new reviewer...');
          AdminTaskManagerService.startTask();
          $http.post('/addcommunityreviewerhandler', {
            review_category: formResponse.type,
            username: formResponse.username,
            language_code: formResponse.languageCode
          }).then(function(response) {
            ctrl.setStatusMessage(
              'Successfully added "' + formResponse.username + '" as ' +
              formResponse.type + ' reviewer.');
            refreshFormData();
          }, handleErrorResponse);
          AdminTaskManagerService.finishTask();
        };

        ctrl.submitViewCommunityReviewersForm = function(formResponse) {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          ctrl.setStatusMessage('Processing query...');
          AdminTaskManagerService.startTask();
          if (formResponse.method === VIEW_METHOD_ROLE) {
            $http.get(
              '/getcommunityreviewershandler', {
                params: {
                  type: formResponse.type,
                  language_code: formResponse.languageCode
                }
              }).then(function(response) {
              ctrl.result.usernames = response.data.usernames;
              ctrl.communityReviewersDataFetched = true;
              ctrl.setStatusMessage('Success.');
            }, handleErrorResponse);
          } else {
            var translationLanguages = [];
            var voiceoverLanguages = [];
            $http.get(
              '/communityreviewerrightsdatahandler', {
                params: {
                  username: formResponse.username
                }
              }).then(function(response) {
              translationLanguages = getLanguageDescriptions(
                response.data.can_review_translation_for_language_codes);
              voiceoverLanguages = getLanguageDescriptions(
                response.data.can_review_voiceover_for_language_codes);
              ctrl.result = {
                translationLanguages: translationLanguages,
                voiceoverLanguages: voiceoverLanguages,
                questions: response.data.can_review_questions
              };
              ctrl.communityReviewersDataFetched = true;
              ctrl.setStatusMessage('Success.');
            }, handleErrorResponse);
          }
          AdminTaskManagerService.finishTask();
        };

        ctrl.submitRemoveCommunityReviewerForm = function(formResponse) {
          if (AdminTaskManagerService.isTaskRunning()) {
            return;
          }
          ctrl.setStatusMessage('Processing query...');
          AdminTaskManagerService.startTask();
          $http.put(
            '/removecommunityreviewerhandler', {
              username: formResponse.username,
              removal_type: formResponse.method,
              review_type: formResponse.type,
              language_code: formResponse.languageCode
            }).then(function(response) {
            ctrl.setStatusMessage('Success.');
            refreshFormData();
          }, handleErrorResponse);
          AdminTaskManagerService.finishTask();
        };

        var refreshFormData = function() {
          ctrl.formData = {
            viewUserRoles: {
              method: VIEW_METHOD_ROLE,
              role: null,
              username: '',
              isValid: function() {
                if (this.method === VIEW_METHOD_ROLE) {
                  return Boolean(this.role);
                }
                if (this.method === VIEW_METHOD_USERNAME) {
                  return Boolean(this.username);
                }
                return false;
              }
            },
            updateRole: {
              newRole: null,
              username: '',
              topicId: null,
              isValid: function() {
                if (this.newRole === 'TOPIC_MANAGER') {
                  return Boolean(this.topicId);
                } else if (this.newRole) {
                  return Boolean(this.username);
                }
                return false;
              }
            },
            viewCommunityReviewers: {
              method: VIEW_METHOD_ROLE,
              username: '',
              type: null,
              languageCode: null,
              isValid: function() {
                if (this.method === VIEW_METHOD_ROLE) {
                  if (this.type === null) {
                    return false;
                  }
                  if (
                    this.type === REVIEW_CATEGORY_TRANSLATION ||
                    this.type === REVIEW_CATEGORY_VOICEOVER) {
                    return Boolean(this.languageCode);
                  }
                  return true;
                }

                if (this.method === VIEW_METHOD_USERNAME) {
                  return Boolean(this.username);
                }
              }
            },
            addCommunityReviewer: {
              username: '',
              type: null,
              languageCode: null,
              isValid: function() {
                if (this.username === '') {
                  return false;
                }
                if (this.type === null) {
                  return false;
                }
                if (
                  this.type === REVIEW_CATEGORY_TRANSLATION ||
                  this.type === REVIEW_CATEGORY_VOICEOVER) {
                  return Boolean(this.languageCode);
                }
                return true;
              }
            },
            removeCommunityReviewer: {
              username: '',
              method: ACTION_REMOVE_ALL_REVIEW_RIGHTS,
              type: null,
              languageCode: null,
              isValid: function() {
                if (this.username === '') {
                  return false;
                }
                if (this.method === ACTION_REMOVE_ALL_REVIEW_RIGHTS) {
                  return Boolean(this.username);
                } else {
                  if (this.type === null) {
                    return false;
                  }
                  if (
                    this.type === REVIEW_CATEGORY_TRANSLATION ||
                    this.type === REVIEW_CATEGORY_VOICEOVER) {
                    return Boolean(this.languageCode);
                  }
                  return true;
                }
              }
            }
          };
        };

        ctrl.$onInit = function() {
          ctrl.ACTION_REMOVE_ALL_REVIEW_RIGHTS = (
            ACTION_REMOVE_ALL_REVIEW_RIGHTS);
          ctrl.ACTION_REMOVE_SPECIFIC_REVIEW_RIGHTS = (
            ACTION_REMOVE_SPECIFIC_REVIEW_RIGHTS);
          ctrl.VIEW_METHOD_USERNAME = VIEW_METHOD_USERNAME;
          ctrl.VIEW_METHOD_ROLE = VIEW_METHOD_ROLE;
          ctrl.UPDATABLE_ROLES = {};
          ctrl.VIEWABLE_ROLES = {};
          ctrl.REVIEWABLE_ITEMS = {
            TRANSLATION: REVIEW_CATEGORY_TRANSLATION,
            VOICEOVER: REVIEW_CATEGORY_VOICEOVER,
            QUESTION: REVIEW_CATEGORY_QUESTION
          };
          refreshFormData();
          ctrl.resultRolesVisible = false;
          ctrl.communityReviewersDataFetched = false;
          ctrl.result = {};
          ctrl.setStatusMessage('');

          ctrl.languageCodesAndDescriptions = (
            LanguageUtilService.getAllVoiceoverLanguageCodes().map(
              function(languageCode) {
                return {
                  id: languageCode,
                  description: (
                    LanguageUtilService.getAudioLanguageDescription(
                      languageCode))
                };
              }));
          ctrl.topicSummaries = {};
          ctrl.graphData = {};
          ctrl.graphDataLoaded = false;
          AdminDataService.getDataAsync().then(function(response) {
            ctrl.UPDATABLE_ROLES = response.updatable_roles;
            ctrl.VIEWABLE_ROLES = response.viewable_roles;
            ctrl.topicSummaries = response.topic_summaries;
            ctrl.graphData = response.role_graph_data;

            ctrl.graphDataLoaded = false;
            // Calculating initStateId and finalStateIds for graphData
            // Since role graph is acyclic, node with no incoming edge
            // is initState and nodes with no outgoing edge are finalStates.
            var hasIncomingEdge = [];
            var hasOutgoingEdge = [];
            for (var i = 0; i < ctrl.graphData.links.length; i++) {
              hasIncomingEdge.push(ctrl.graphData.links[i].target);
              hasOutgoingEdge.push(ctrl.graphData.links[i].source);
            }
            var finalStateIds = [];
            for (var role in ctrl.graphData.nodes) {
              if (ctrl.graphData.nodes.hasOwnProperty(role)) {
                if (hasIncomingEdge.indexOf(role) === -1) {
                  ctrl.graphData.initStateId = role;
                }
                if (hasOutgoingEdge.indexOf(role) === -1) {
                  finalStateIds.push(role);
                }
              }
            }
            ctrl.graphData.finalStateIds = finalStateIds;
            ctrl.graphDataLoaded = true;
            // TODO(#8521): Remove the use of $rootScope.$apply()
            // once the directive is migrated to angular
            $rootScope.$apply();
          });
        };
      }]
    };
  }
]);
