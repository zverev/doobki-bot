module.exports = {
    createHash: function(collection, key) {
        var hash = {};
        collection.map(function(el) {
            hash[el[key]] = el;
        });
        return hash;
    }
}
