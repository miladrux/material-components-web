/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import td from 'testdouble';

import MDCFixedTopAppBarFoundation from '../../../packages/mdc-top-app-bar/fixed/foundation';
import MDCTopAppBarFoundation from '../../../packages/mdc-top-app-bar/foundation';
import {createMockRaf} from '../helpers/raf';

suite('MDCFixedTopAppBarFoundation');

const setupTest = () => {
  const mockAdapter = td.object(MDCTopAppBarFoundation.defaultAdapter);

  const foundation = new MDCFixedTopAppBarFoundation(mockAdapter);

  return {foundation, mockAdapter};
};

const createMockHandlers = (foundation, mockAdapter, mockRaf) => {
  let scrollHandler;
  td.when(mockAdapter.registerScrollHandler(td.matchers.isA(Function))).thenDo((fn) => {
    scrollHandler = fn;
  });

  foundation.init();
  mockRaf.flush();
  td.reset();
  return {scrollHandler};
};

test('fixed top app bar: scroll listener is registered on init', () => {
  const {foundation, mockAdapter} = setupTest();
  td.when(mockAdapter.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED_CLASS)).thenReturn(true);
  foundation.init();
  td.verify(mockAdapter.registerScrollHandler(td.matchers.isA(Function)), {times: 1});
});

test('fixed top app bar: scroll listener is removed on destroy', () => {
  const {foundation, mockAdapter} = setupTest();
  td.when(mockAdapter.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED_CLASS)).thenReturn(true);
  foundation.init();
  foundation.destroy();
  td.verify(mockAdapter.deregisterScrollHandler(td.matchers.isA(Function)), {times: 1});
});

test('fixed top app bar: class is added once when page is scrolled from the top', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();

  td.when(mockAdapter.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED_CLASS)).thenReturn(true);
  td.when(mockAdapter.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED_SCROLLED_CLASS)).thenReturn(false);
  td.when(mockAdapter.getTotalActionItems()).thenReturn(0);
  td.when(mockAdapter.getViewportScrollY()).thenReturn(0);

  const {scrollHandler} = createMockHandlers(foundation, mockAdapter, mockRaf);
  td.when(mockAdapter.getViewportScrollY()).thenReturn(1);

  scrollHandler();
  scrollHandler();

  td.verify(mockAdapter.addClass(MDCTopAppBarFoundation.cssClasses.FIXED_SCROLLED_CLASS), {times: 1});
});

test('fixed top app bar: class is removed once when page is scrolled to the top', () => {
  const {foundation, mockAdapter} = setupTest();
  const mockRaf = createMockRaf();

  td.when(mockAdapter.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED_CLASS)).thenReturn(true);
  td.when(mockAdapter.hasClass(MDCTopAppBarFoundation.cssClasses.FIXED_SCROLLED_CLASS)).thenReturn(false);
  td.when(mockAdapter.getTotalActionItems()).thenReturn(0);

  const {scrollHandler} = createMockHandlers(foundation, mockAdapter, mockRaf);
  // Apply the scrolled class
  td.when(mockAdapter.getViewportScrollY()).thenReturn(1);
  scrollHandler();

  // Test removing it
  td.when(mockAdapter.getViewportScrollY()).thenReturn(0);
  scrollHandler();
  scrollHandler();

  td.verify(mockAdapter.removeClass(MDCTopAppBarFoundation.cssClasses.FIXED_SCROLLED_CLASS), {times: 1});
});
