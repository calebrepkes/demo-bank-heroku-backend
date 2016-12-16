exports.showIndex = function (req, res) {
    console.log('Show home page.');
    res.sendFile(__dirname + '/html_pages/index.html')
}