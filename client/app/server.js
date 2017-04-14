import {readDocument, writeDocument, addDocument, deleteDocument, getCollection} from './database.js';

/**
 * Emulates how a REST call is *asynchronous* -- it calls your function back
 * some time in the future with data.
 */
function emulateServerReturn(data, cb) {
  setTimeout(() => {
    cb(data);
  }, 4);
}

/**
 * Resolves a feed item. Internal to the server, since it's synchronous.
 */
function getFeedItemSync(feedItemId) {
  var feedItem = readDocument('feedItems', feedItemId);
  // Resolve 'like' counter.
  feedItem.likeCounter = feedItem.likeCounter.map((id) => readDocument('users', id));
  // Assuming a StatusUpdate. If we had other types of FeedItems in the DB, we would
  // need to check the type and have logic for each type.
  feedItem.contents.author = readDocument('users', feedItem.contents.author);
  // Resolve comment author.
  feedItem.comments.forEach((comment) => {
    comment.author = readDocument('users', comment.author);
  });
  return feedItem;
}

/**
 * Emulates a REST call to get the feed data for a particular user.

export function getFeedData(user, cb) {
  var userData = readDocument('users', user);
  var feedData = readDocument('feeds', userData.feed);
  // While map takes a callback, it is synchronous, not asynchronous.
  // It calls the callback immediately.
  feedData.contents = feedData.contents.map(getFeedItemSync);
  // Return FeedData with resolved references.
  emulateServerReturn(feedData, cb);
}
 */
 export function getFeedData(user, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/user/4/feed');
  xhr.setRequestHeader('Authorization', 'Bearer jsontokenhere');
  xhr.addEventListener('load', function() {
    // Call the callback with the data.
    cb(JSON.parse(xhr.responseText));
  });
  xhr.send();
}
 
/**
 * Adds a new status update to the database.
 */
/**
 * Adds a new status update to the database.
 */
export function postStatusUpdate(user, location, contents, cb) {
  sendXHR('POST', '/feeditem', {
    userId: user,
    location: location,
    contents: contents
  }, (xhr) => {
    // Return the new status update.
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Adds a new comment to the database on the given feed item.
 */
export function postComment(feedItemId, author, contents, cb) {
  var feedItem = readDocument('feedItems', feedItemId);
  feedItem.comments.push({
    "author": author,
    "contents": contents,
    "postDate": new Date().getTime(),
    "likeCounter": []
  });
  writeDocument('feedItems', feedItem);
  // Return a resolved version of the feed item.
  emulateServerReturn(getFeedItemSync(feedItemId), cb);
}

/**
 * Updates a feed item's likeCounter by adding the user to the likeCounter.
 * Provides an updated likeCounter in the response.
 */
export function likeFeedItem(feedItemId, userId, cb) {
  sendXHR('PUT', '/feeditem/' + feedItemId + '/likelist/' + userId, 
          undefined, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Updates a feed item's likeCounter by removing the user 
 * from the likeCounter. Provides an updated likeCounter 
 * in the response.
 */
export function unlikeFeedItem(feedItemId, userId, cb) {
  sendXHR('DELETE', '/feeditem/' + feedItemId + '/likelist/' + userId, 
        undefined, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Adds a 'like' to a comment.
 */
export function likeComment(feedItemId, commentIdx, userId, cb) {
  var feedItem = readDocument('feedItems', feedItemId);
  var comment = feedItem.comments[commentIdx];
  comment.likeCounter.push(userId);
  writeDocument('feedItems', feedItem);
  comment.author = readDocument('users', comment.author);
  emulateServerReturn(comment, cb);
}

/**
 * Removes a 'like' from a comment.
 */
export function unlikeComment(feedItemId, commentIdx, userId, cb) {
  var feedItem = readDocument('feedItems', feedItemId);
  var comment = feedItem.comments[commentIdx];
  var userIndex = comment.likeCounter.indexOf(userId);
  if (userIndex !== -1) {
    comment.likeCounter.splice(userIndex, 1);
    writeDocument('feedItems', feedItem);
  }
  comment.author = readDocument('users', comment.author);
  emulateServerReturn(comment, cb);
}

/**
 * Updates the text in a feed item (assumes a status update)
 */
export function updateFeedItemText(feedItemId, newContent, cb) {
  sendXHR('PUT', '/feeditem/' + feedItemId + '/content', newContent, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Deletes a feed item.
 */
export function deleteFeedItem(feedItemId, cb) {
  sendXHR('DELETE', '/feeditem/' + feedItemId, undefined, () => {
    cb();
  });
}

  // Return nothing. The return just tells the client that
  // the server has acknowledged the request, and that it has
  // been a success.
  emulateServerReturn(null, cb);
}

/**
 * Searches for feed items with the given text.
 */
/**
 * Searches for feed items with the given text.
 */
export function searchForFeedItems(userID, queryText, cb) {
  // userID is not needed; it's included in the JSON web token.
  sendXHR('POST', '/search', queryText, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}
