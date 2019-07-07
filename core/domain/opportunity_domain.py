# coding: utf-8
#
# Copyright 2019 The Oppia Authors. All Rights Reserved.
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

"""Domain object for contribution opportunities."""

from constants import constants
import utils


class ExplorationOpportunitySummary(object):
    """The domain object for the translation and voiceover opportunities summary
    available in an exploration.
    """
    def __init__(
            self, exp_id, topic_id, topic_name, story_id, story_title,
            chapter_title, content_count, incomplete_translation_languages,
            translation_count, need_voiceartist_in_languages,
            assigned_voiceartist_in_languages):
        """Constructs a ExplorationOpportunitySummary domain object.

        Args:
            exp_id: str. The unique id of the exploration.
            topic_id: str. The unique id of the topic.
            topic_name: str. The name of the topic.
            story_id: str. The uniques id of the story.
            story_title: str. The title of the story.
            chapter_title: str. The title of the story chapter.
            content_count: int. The total number of content available in the
                exploration.
            incomplete_translation_languages: list(str). A list of language code
                in which the exploration translation is incomplete.
            translation_count: dict. A dict with language code as a key and
                number of translation available in that language as the value.
            need_voiceartist_in_languages: list(str). A list of language code
                in which the exploration needs voice artist.
            assigned_voiceartist_in_languages: list(str). A list of language
                code for which a voice-artist is already assigned to the
                exploration.
        """
        self.id = exp_id
        self.topic_id = topic_id
        self.topic_name = topic_name
        self.story_id = story_id
        self.story_title = story_title
        self.chapter_title = chapter_title
        self.content_count = content_count
        self.incomplete_translation_languages = incomplete_translation_languages
        self.translation_count = translation_count
        self.need_voiceartist_in_languages = need_voiceartist_in_languages
        self.assigned_voiceartist_in_languages = (
            assigned_voiceartist_in_languages)
        self.validate()

    @classmethod
    def from_dict(cls, exploration_opportunity_summary_dict):
        """Return a ExplorationOpportunitySummary domain object from a dict.

        Args:
            exploration_opportunity_summary_dict: dict. The dict representation
                of ExplorationOpportunitySummary object.

        Returns:
            ExplorationOpportunitySummary. The corresponding
                ExplorationOpportunitySummary domain object.
        """
        return cls(
            exploration_opportunity_summary_dict['id'],
            exploration_opportunity_summary_dict['topic_id'],
            exploration_opportunity_summary_dict['topic_name'],
            exploration_opportunity_summary_dict['story_id'],
            exploration_opportunity_summary_dict['story_title'],
            exploration_opportunity_summary_dict['chapter_title'],
            exploration_opportunity_summary_dict['content_count'],
            exploration_opportunity_summary_dict[
                'incomplete_translation_languages'],
            exploration_opportunity_summary_dict['translation_count'],
            exploration_opportunity_summary_dict[
                'need_voiceartist_in_languages'],
            exploration_opportunity_summary_dict[
                'assigned_voiceartist_in_languages'])


    def validate(self):
        """Validates various properties of the object.

        Raises:
            ValidationError: One or more attributes of the object are invalid.
        """
        if not isinstance(self.topic_id, basestring):
            raise utils.ValidationError(
                'Expected topic_id to be a string, received %s' % self.topic_id)
        if not isinstance(self.topic_name, basestring):
            raise utils.ValidationError(
                'Expected topic_name to be a string, received %s' %
                self.topic_name)
        if not isinstance(self.story_id, basestring):
            raise utils.ValidationError(
                'Expected story_id to be a string, received %s' % self.story_id)
        if not isinstance(self.story_title, basestring):
            raise utils.ValidationError(
                'Expected story_title to be a string, received %s' %
                self.story_title)
        if not isinstance(self.chapter_title, basestring):
            raise utils.ValidationError(
                'Expected chapter_title to be a string, received %s' %
                self.chapter_title)
        if not isinstance(self.content_count, int):
            raise utils.ValidationError(
                'Expected content_count to be an integer, received %s' %
                self.content_count)

        allowed_language_codes = [language['id'] for language in (
            constants.SUPPORTED_AUDIO_LANGUAGES)]

        if not set(self.assigned_voiceartist_in_languages).isdisjoint(
                self.need_voiceartist_in_languages):
            raise utils.ValidationError(
                'Expected voiceartist need and assigned list of languages to '
                'be unique, received: %s, %s' % (
                    self.need_voiceartist_in_languages,
                    self.assigned_voiceartist_in_languages))
        for language_code, count in (
                self.translation_count.iteritems()):
            if language_code not in allowed_language_codes:
                raise utils.ValidationError(
                    'Invalid language_code: %s' % language_code)
            if not isinstance(count, int):
                raise utils.ValidationError(
                    'Expected count for language_code %s to be an integer, '
                    'received %s' % (language_code, count))
            if count > self.content_count:
                raise utils.ValidationError(
                    'Expected translation count for language_code %s to be an '
                    'less than or equal to content_count(%s), received %s' % (
                        language_code, self.content_count, count))

        expected_set_of_all_languages = set(
            self.incomplete_translation_languages +
            self.need_voiceartist_in_languages +
            self.assigned_voiceartist_in_languages)

        for language_code in expected_set_of_all_languages:
            if language_code not in allowed_language_codes:
                raise utils.ValidationError(
                    'Invalid language_code: %s' % language_code)

        if expected_set_of_all_languages != set(allowed_language_codes):
            raise utils.ValidationError(
                'Expected set of all languages available in '
                'incomplete_translation, needs_voiceover and assigned_voiceover'
                ' to be the same as the supported audio languages, '
                'received %s' % list(expected_set_of_all_languages))
