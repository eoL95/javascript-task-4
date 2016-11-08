'use strict';

var FUNCTION_PRIORITY = {
    'and': 1,
    'or': 2,
    'filterIn': 3,
    'sortBy': 4,
    'select': 5,
    'limit': 6,
    'format': 7
};
exports.isStar = true;

function copyCollection(collection) {
    if (collection === undefined) {
        return [];
    }

    return collection.map(function (note) {
        return Object.assign({}, note);
    });
}

exports.query = function (collection) {
    var newCollection = copyCollection(collection);
    var functions = [].slice.call(arguments, 1);

    functions.sort(function (a, b) {
        return FUNCTION_PRIORITY[a.name] - FUNCTION_PRIORITY[b.name];
    });

    functions.forEach(function (func) {
        newCollection = func(newCollection);
    });

    return newCollection;
};

exports.select = function () {
    var selectedFields = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (note) {
            var newNote = {};

            selectedFields.forEach(function (field) {
                if (note.hasOwnProperty(field) && note[field] !== undefined) {
                    newNote[field] = note[field];
                }
            });

            return newNote;
        });
    };
};

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        var newCollection = [];

        collection.forEach(function (note) {
            if (values.indexOf(note[property]) !== -1) {
                newCollection.push(note);
            }
        });

        return newCollection;
    };
};

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        var newCollection = copyCollection(collection);

        return newCollection.sort(function (firstNote, secondNote) {
            if (order === 'asc') {
                return firstNote[property] > secondNote[property] ? 1 : -1;
            }

            return firstNote[property] < secondNote[property] ? 1 : -1;
        });
    };
};

exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (note) {
            if (note.hasOwnProperty(property)) {
                note[property] = formatter(note[property]);
            }

            return note;
        });
    };
};

exports.limit = function (count) {
    return function limit(collection) {
        var newCollection = copyCollection(collection);

        return newCollection.slice(0, count);
    };
};

if (exports.isStar) {

    exports.or = function () {
        var filters = [].slice.call(arguments);

        return function or(collection) {
            var newCollection = [];
            var filteredCollections = filters.map(function (filter) {
                return filter(collection);
            });

            collection.forEach(function (note) {
                if (filteredCollections.some(function (filteredCollection) {
                    return filteredCollection.indexOf(note) !== -1;
                })) {
                    newCollection.push(note);
                }
            });

            return newCollection;
        };
    };

    exports.and = function () {
        var filters = [].slice.call(arguments);

        return function and(collection) {
            filters.forEach(function (filter) {
                collection = filter(collection);
            });

            return collection;
        };
    };
}
