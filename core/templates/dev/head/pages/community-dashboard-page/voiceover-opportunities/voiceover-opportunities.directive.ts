// Copyright 2019 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Directive for the voiceover opportunities.
 */

require(
  'pages/community-dashboard-page/opportunities-list/' +
  'opportunities-list.directive.ts');

require(
  'pages/community-dashboard-page/services/' +
  'contribution-opportunities.service.ts');
require(
  'pages/exploration-editor-page/translation-tab/services/' +
  'translation-language.service.ts');

var oppia = require('AppInit.ts').module;

oppia.directive('voiceoverOpportunities', ['UrlInterpolationService', function(
    UrlInterpolationService) {
  return {
    restrict: 'E',
    scope: {},
    bindToController: {},
    templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
      '/pages/community-dashboard-page/translation-opportunities/' +
      'translation-opportunities.directive.html'),
    controllerAs: '$ctrl',
    controller: [
      '$scope', 'ContributionOpportunitiesService',
      'TranslationLanguageService', function(
          $scope, ContributionOpportunitiesService,
          TranslationLanguageService) {
        var ctrl = this;
        ctrl.opportunities = [];
        ctrl.isLoading = true;
        ctrl.moreOpportunitiesAvailable = true;
        ctrl.progressBarRequired = false;
        var updateWithNewOpportunities = function(opportunities, more) {
          for (index in opportunities) {
            var opportunity = opportunities[index];
            var subheading = opportunity.topic + ' - ' + opportunity.story;
            var heading = opportunity.chapter;

            ctrl.opportunities.push({
              heading: heading,
              subheading: subheading,
              actionButtonTitle: 'Request to Voiceover'
            });
          }
          ctrl.moreOpportunitiesAvailable = more;
          ctrl.isLoading = false;
        };

        $scope.$on('activeLanguageChanged', function() {
          ctrl.opportunities = [];
          ctrl.isLoading = true;
          ContributionOpportunitiesService.getVoiceoverOpportunities(
            TranslationLanguageService.getActiveLanguageCode(),
            updateWithNewOpportunities);
        });

        ctrl.onLoadMoreOpportunities = function() {
          if (!ctrl.isLoading && ctrl.moreOpportunitiesAvailable) {
            ctrl.isLoading = true;
            ContributionOpportunitiesService.getMoreVoiceoverOpportunities(
              TranslationLanguageService.getActiveLanguageCode(),
              updateWithNewOpportunities);
          }
        };

        ContributionOpportunitiesService.getVoiceoverOpportunities(
          TranslationLanguageService.getActiveLanguageCode(),
          updateWithNewOpportunities);
      }
    ]
  };
}]);
