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
 * @fileoverview Page object for the community dashboard, for use in Protractor
 * tests.
 */
var waitFor = require('./waitFor.js');

var CommunityDashboardTranslateTextTab = require(
  '../protractor_utils/CommunityDashboardTranslateTextTab.js');
var CommunityDashboardPage = function() {
  var navigateToTranslateTextTabButton = element(
    by.css('.protractor-test-translateTextTab'));

  var reviewRightsDiv = element(by.css('.protractor-test-review-rights'));

  this.get = function() {
    browser.get('/community_dashboard');
    waitFor.pageToFullyLoad();
  };

  this.getTranslateTextTab = function() {
    return new CommunityDashboardTranslateTextTab
      .CommunityDashboardTranslateTextTab();
  };

  this.expectUserToBeTranslationReviewer = function(language) {
    waitFor.visibilityOf(
      reviewRightsDiv, 'User does not have rights to review translation');

    var translationReviewRightsElement = element(by.css(
      '.protractor-test-translation-' + language + '-reviewer'));
    waitFor.visibilityOf(
      translationReviewRightsElement,
      'User does not have rights to review translation in language: ' + language
    );
  };

  var _expecteUserToBeReviewer = function(
      reviewCategory, langaugeDescription = null) {
    waitFor.visibilityOf(
      reviewRightsDiv, 'User does not have rights to review translation');

    var reviewRightsElementClassName = ('.protractor-test-' + reviewCategory);
    if (langaugeDescription !== null) {
      reviewRightsElementClassName += '-' + langaugeDescription;
    }
    reviewRightsElementClassName += '-reviewer';

    var reviewRightsElement = element(by.css(reviewRightsElementClassName));
    waitFor.visibilityOf(
      reviewRightsElement,
      'User does not have rights to review ' + reviewCategory);
  };

  this.expectUserToBeTranslationReviewer = function(langaugeDescription) {
    _expecteUserToBeReviewer('translation', langaugeDescription);
  };

  this.expectUserToBeVoiceoverReviewer = function(langaugeDescription) {
    _expecteUserToBeReviewer('voiceover', langaugeDescription);
  };

  this.expectUserToBeQuestionReviewer = function() {
    _expecteUserToBeReviewer('question');
  };

  this.navigateToTranslateTextTab = function() {
    waitFor.elementToBeClickable(
      navigateToTranslateTextTabButton, 'Translate text tab is not clickable');
    navigateToTranslateTextTabButton.click();
    waitFor.pageToFullyLoad();
  };
};

exports.CommunityDashboardPage = CommunityDashboardPage;
