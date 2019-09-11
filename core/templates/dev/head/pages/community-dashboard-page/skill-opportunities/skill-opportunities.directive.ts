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
 * @fileoverview Directive for skill opportunities.
 */

require(
  'pages/community-dashboard-page/opportunities-list/' +
  'opportunities-list.directive.ts');

require(
  'pages/community-dashboard-page/services/' +
  'contribution-opportunities.service.ts');

angular.module('oppia').directive(
  'skillOpportunities', ['UrlInterpolationService', function(
      UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {},
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/community-dashboard-page/skill-opportunities/' +
      'skill-opportunities.directive.html'),
      controllerAs: '$ctrl',
      controller: [
        'ContributionOpportunitiesService',
        function(ContributionOpportunitiesService) {
          var ctrl = this;
          ctrl.opportunities = [];
          ctrl.opportunitiesAreLoading = true;
          ctrl.moreOpportunitiesAvailable = true;
          var updateWithNewOpportunities = function(opportunities, more) {
            for (var index in opportunities) {
              var opportunity = opportunities[index];
              var heading = opportunity.topic_name;
              var subheading = opportunity.skill_description;
              var progressPercentage = (
                (opportunity.question_count / 50) * 100).toFixed(2);
              ctrl.opportunities.push({
                heading: heading,
                subheading: subheading,
                progressPercentage: progressPercentage,
                actionButtonTitle: 'Suggest Question'
              });
            }
            ctrl.moreOpportunitiesAvailable = more;
            ctrl.opportunitiesAreLoading = false;
          };

          ctrl.onLoadMoreOpportunities = function() {
            if (
              !ctrl.opportunitiesAreLoading &&
                ctrl.moreOpportunitiesAvailable) {
              ctrl.opportunitiesAreLoading = true;
              ContributionOpportunitiesService.getMoreSkillOpportunities(
                updateWithNewOpportunities);
            }
          };

          ContributionOpportunitiesService.getSkillOpportunities(
            updateWithNewOpportunities);
        }
      ]
    };
  }]);
