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
 * @fileoverview Service to retrieve read only information
 * about collections from the backend.
 */

import { downgradeInjectable } from '@angular/upgrade/static';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import cloneDeep from 'lodash/cloneDeep';

import { AppConstants } from 'app.constants';
import { CollectionBackendDict, CollectionObjectFactory, Collection } from
  'domain/collection/CollectionObjectFactory';
import { UrlInterpolationService } from
  'domain/utilities/url-interpolation.service';

interface CollectionCache {
  [collectionId: string]: Collection;
}

interface CollectionDetails {
  canEdit: boolean;
  title: string;
}

interface CollectionDetailsCache {
  [collectionId: string]: CollectionDetails;
}

interface ReadOnlyCollectionBackendResponse {
  'meta_name': string;
  'can_edit': boolean;
  'meta_description': string;
  'collection': CollectionBackendDict;
}

// TODO(bhenning): For preview mode, this service should be replaced by a
// separate CollectionDataService implementation which returns a local copy of
// the collection instead. This file should not be included on the page in that
// scenario.
@Injectable({
  providedIn: 'root'
})
export class ReadOnlyCollectionBackendApiService {
  constructor(
    private http: HttpClient,
    private collectionObjectFactory: CollectionObjectFactory,
    private urlInterpolationService: UrlInterpolationService) {}
  private _collectionCache: CollectionCache = {};
  private _collectionDetailsCache: CollectionDetailsCache = {};

  private _fetchCollection(
      collectionId: string,
      successCallback: (value: Collection) => void,
      errorCallback: (reason: string) => void): void {
    var collectionDataUrl = this.urlInterpolationService.interpolateUrl(
      AppConstants.COLLECTION_DATA_URL_TEMPLATE, {
        collection_id: collectionId
      });

    this.http.get<ReadOnlyCollectionBackendResponse>(
      collectionDataUrl).toPromise().then(response => {
      this._cacheCollectionDetails(response);
      var collectionObject = this.collectionObjectFactory.create(
        response.collection);
      if (successCallback) {
        successCallback(collectionObject);
      }
    }, errorResponse => {
      if (errorCallback) {
        errorCallback(errorResponse.error.error);
      }
    });
  }

  private _cacheCollectionDetails(
      details: ReadOnlyCollectionBackendResponse): void {
    this._collectionDetailsCache[details.collection.id] = {
      canEdit: details.can_edit,
      title: details.collection.title,
    };
  }

  private _isCached(collectionId: string): boolean {
    return this._collectionCache.hasOwnProperty(collectionId);
  }

  /**
   * Retrieves a collection from the backend given a collection ID. This
   * returns a promise object that allows a success and rejection callbacks
   * to be registered. If the collection is successfully loaded and a
   * success callback function is provided to the promise object, the
   * success callback is called with the collection passed in as a
   * parameter. If something goes wrong while trying to fetch the
   * collection, the rejection callback is called instead, if present. The
   * rejection callback function is passed the error that occurred and the
   * collection ID.
   */
  fetchCollection(collectionId: string): Promise<Collection> {
    return new Promise((resolve, reject) => {
      this._fetchCollection(collectionId, resolve, reject);
    });
  }

  /**
   * Behaves in the exact same way as fetchCollection (including callback
   * behavior and returning a promise object), except this function will
   * attempt to see whether the given collection has already been loaded. If
   * it has not yet been loaded, it will fetch the collection from the
   * backend. If it successfully retrieves the collection from the backend,
   * it will store it in the cache to avoid requests from the backend in
   * further function calls.
   */
  loadCollection(collectionId: string): Promise<Collection> {
    return new Promise((resolve, reject) => {
      if (this._isCached(collectionId)) {
        if (resolve) {
          resolve(cloneDeep(this._collectionCache[collectionId]));
        }
      } else {
        this._fetchCollection(collectionId, collection => {
          // Save the fetched collection to avoid future fetches.
          this._collectionCache[collectionId] = collection;
          if (resolve) {
            resolve(cloneDeep(collection));
          }
        }, reject);
      }
    });
  }

  getCollectionDetails(collectionId: string): CollectionDetails {
    if (this._collectionDetailsCache[collectionId]) {
      return this._collectionDetailsCache[collectionId];
    } else {
      throw new Error('collection has not been fetched');
    }
  }

  /**
   * Returns whether the given collection is stored within the local data
   * cache or if it needs to be retrieved from the backend upon a laod.
   */
  isCached(collectionId: string): boolean {
    return this._isCached(collectionId);
  }

  /**
   * Replaces the current collection in the cache given by the specified
   * collection ID with a new collection object.
   */
  cacheCollection(collectionId: string, collection: Collection): void {
    this._collectionCache[collectionId] = cloneDeep(collection);
  }

  /**
   * Clears the local collection data cache, forcing all future loads to
   * re-request the previously loaded collections from the backend.
   */
  clearCollectionCache(): void {
    this._collectionCache = {};
  }
}

angular.module('oppia').factory(
  'ReadOnlyCollectionBackendApiService',
  downgradeInjectable(ReadOnlyCollectionBackendApiService));
