// Copyright 2016 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Controllers for the about page.
 */

require(
  'components/common-layout-directives/common-elements/' +
  'background-banner.directive.ts');

require('domain/utilities/url-interpolation.service.ts');

angular.module('oppia').directive('aboutPage', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {},
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/about-page/about-page.directive.html'),
      controllerAs: '$ctrl',
      controller: [
        'UrlInterpolationService', 'WindowRef',
        function(UrlInterpolationService, WindowRef) {
          const ctrl = this;
          const activeTabClass = 'oppia-about-tabs-active';
          const hash = window.location.hash.slice(1);
          const visibleContent = 'oppia-about-visible-content';
          const listOfNamesToThank = [
            'Alex Kauffmann', 'Allison Barros',
            'Amy Latten', 'Brett Barros',
            'Crystal Kwok', 'Daniel Hernandez',
            'Divya Siddarth', 'Ilwon Yoon',
            'Jennifer Chen', 'John Cox',
            'John Orr', 'Katie Berlent',
            'Michael Wawszczak', 'Mike Gainer',
            'Neil Fraser', 'Noah Falstein',
            'Nupur Jain', 'Peter Norvig',
            'Philip Guo', 'Piotr Mitros',
            'Rachel Chen', 'Rahim Nathwani',
            'Robyn Choo', 'Tricia Ngoon',
            'Vikrant Nanda', 'Vinamrata Singal',
            'Yarin Feigenbaum'];

          const activateTab = function(tabName: string) {
            $("a[id='" + tabName + "']").parent().addClass(
              activeTabClass
            ).siblings().removeClass(activeTabClass);
            $('.' + tabName).addClass(visibleContent).siblings().removeClass(
              visibleContent
            );
          };

          ctrl.onTabClick = function(tabName: string) {
            // Update hash
            WindowRef.nativeWindow.location.hash = '#' + tabName;
            activateTab(tabName);
          };
          ctrl.getStaticImageUrl = function(imagePath: string) {
            return UrlInterpolationService.getStaticImageUrl(imagePath);
          };
          ctrl.$onInit = function() {
            // Define constants
            ctrl.TAB_ID_ABOUT = 'about';
            ctrl.TAB_ID_FOUNDATION = 'foundation';
            ctrl.TAB_ID_CREDITS = 'credits';

            var hash = WindowRef.nativeWindow.location.hash.slice(1);
            if (hash === ctrl.TAB_ID_FOUNDATION || hash === 'license') {
              activateTab(ctrl.TAB_ID_FOUNDATION);
            }

            if (hash === ctrl.TAB_ID_CREDITS) {
              activateTab(ctrl.TAB_ID_CREDITS);
            }

            if (hash === ctrl.TAB_ID_ABOUT) {
              activateTab(ctrl.TAB_ID_ABOUT);
            }
            ctrl.listOfNames = listOfNamesToThank
              .slice(0, listOfNamesToThank.length - 1).join(', ') +
              ' & ' + listOfNamesToThank[listOfNamesToThank.length - 1];
            ctrl.aboutPageMascotImgUrl = UrlInterpolationService
              .getStaticImageUrl('/general/about_page_mascot.png');

            WindowRef.nativeWindow.onhashchange = function() {
              const hashChange = window.location.hash.slice(1);
              if (hashChange === ctrl.TAB_ID_FOUNDATION || (
                hashChange === 'license')) {
                activateTab(ctrl.TAB_ID_FOUNDATION);
                // Ensure page goes to the license section
                if (hashChange === 'license') {
                  WindowRef.nativeWindow.location.reload(true);
                }
              } else if (hashChange === ctrl.TAB_ID_CREDITS) {
                activateTab(ctrl.TAB_ID_CREDITS);
              } else if (hashChange === ctrl.TAB_ID_ABOUT) {
                activateTab(ctrl.TAB_ID_ABOUT);
              }
            };
          };
        }
      ]
    };
  }]);
