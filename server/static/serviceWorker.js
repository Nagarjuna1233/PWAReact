'use strict';

//Cache polyfil to support cacheAPI in all browsers
//importScripts('./js/cache-polyfill.js');
var cacheName = 'initial-cache-v1';
var files = [
  '/',
  './index.html'
];

//Adding `install` event listener
self.addEventListener('install', function (event) {
  console.info('Event: Install');
  event.waitUntil(
    caches.open(cacheName)
    .then(function (cache) {
      //[] of files to cache & if any of the file not present `addAll` will fail
      return cache.addAll(files)
      .then(function () {
        console.info('All files are cached');
        return self.skipWaiting(); //To forces the waiting service worker to become the active service worker
      })
      .catch(function (error) {
        console.error('Failed to cache', error);
      })
    })
  );
});

/*
  FETCH EVENT: triggered for every request made by index page, after install.
*/

//Adding `fetch` event listener
self.addEventListener('fetch', function (event) {
  var request = event.request;
  //Tell the browser to wait for newtwork request and respond with below
  event.respondWith(
    //If request is already in cache, return it
    caches.match(request).then(function(response) {
      if (response) {
        console.info('request loading from cache')
        return response;
      }
      //if request is not cached, add it to cache
      return fetch(request).then(function(response) {
        var responseToCache = response.clone();
        caches.open(cacheName).then(
          function(cache) {
            cache.put(request, responseToCache).catch(function(err) {
              console.warn(request.url + ': ' + err.message);
            });
          });
        return response;
      });
    })
  );
});

/*
  ACTIVATE EVENT: triggered once after registering, also used to clean up caches.
*/

//Adding `activate` event listener
self.addEventListener('activate', function (event) {
  console.info('service worker: Activate');
  //Active Service Worker to set itself as the active on current client and all other active clients.
  return self.clients.claim();
});
