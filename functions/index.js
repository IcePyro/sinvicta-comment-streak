const functions = require('firebase-functions');
const apitoken = 'AIzaSyCFvKnfb8saX4yE8m7aLUsmbhKzrnY4eLw';

const{ google } = require('googleapis');

async function allVideos(videoId, nextPageToken = '', depth = 0, filter){
    console.log("depth:" + depth);

    const response = await google.youtube('v3').commentThreads.list({
        key: apitoken,
        part: 'snippet',
        q:'',
        textFormat: 'plainText',
        maxResults: 100,
        pageToken: nextPageToken
    })

    if(response.data.items.length >= 100){
        const returnArr= response.data.items;
        return returnArr.concat(await allComments(videoId, response.data.nextPageToken, ++depth));
    }else{
        return response.data.items;
    }
}

async function allComments(videoId, nextPageToken = '', depth = 0){
    console.log("depth:" + depth);

    const response = await google.youtube('v3').commentThreads.list({
        key: apitoken,
        part: 'snippet',
        videoId,
        searchTerms:'day',
        textFormat: 'plainText',
        maxResults: 100,
        pageToken: nextPageToken
    })

    if(response.data.items.length >= 100){
        const returnArr= response.data.items;
        return returnArr.concat(await allComments(videoId, response.data.nextPageToken, ++depth));
    }else{
        return response.data.items;
    }
}

exports.getCommentByVideo = functions.https.onRequest(async (req, res) =>{
    let allItems = await allComments(req.query.videoId);
    console.log('final length: '+allItems.length);
    res.send(allItems);
});

exports.getCommentByName = functions.https.onRequest(async (req, res) => {

    console.log(req.query.name);

    google.youtube('v3').search.list({
        key: apitoken,
        part: 'snippet',
        type: 'channel',
        q: 'UCIO1AgxwznFUv41M31U2c5A'
    }).then((response) => {
        console.log(response);
    }).catch((err) => console.log(err));

    google.youtube('v3').commentThreads.list({
        key: apitoken,
        part: 'snippet',
        videoId: 'OUdnfGrF9Qs',
        searchTerms: req.query.name + ', day',
        textFormat: 'plainText'
    }).then((response) =>{
        res.send(response.data.items);
    }).catch((err) => res.send(err));

});
/*.then((response) =>{
        //console.log(response.data)
        return response;
    }).catch((err) => res.send(err));
    console.log(depth);
    return items.then((prevResponse) => {
        if(prevResponse.data.items.length >= 100 && depth < 5){
            return prevResponse.data.items.concat(allComments(videoId, prevResponse.data.nextPageToken, depth++));
        }else{
            return prevResponse.data.items;
        }
    })*/