'use strict';

var FUNCTION_PRIORITY = ['and', 'or', 'filterIn', 'sortBy', 'select', 'limit', 'format'];
exports.isStar = true;

function deleteRepeatElements(array) {
    var newArray = [];

    array.forEach(function (element) {
        if (newArray.indexOf(element) === -1) {
            newArray.push(element);
        }
    });

    return newArray;
}

function copyCollection(collection) {
    var newCollection = [];

    if (collection === undefined) {
        return [];
    }

    collection.forEach(function (note) {
        var newNote = {};
        for (var key in note) {
            if (note[key] !== undefined) {
                newNote[key] = note[key];
            }
        }
        newCollection.push(newNote);
    });

    return newCollection;
}

exports.query = function (collection) {
    var newCollection = copyCollection(collection);
    var functions = [].slice.call(arguments).slice(1);

    functions.sort(function (a, b) {
        return FUNCTION_PRIORITY.indexOf(a.name) - FUNCTION_PRIORITY.indexOf(b.name);
    });
    console.info(functions);

    for (var i = 0; i < functions.length; i++) {
        newCollection = functions[i](newCollection);
    }

    return newCollection;
};

exports.select = function () {
    var selectedFields = [].slice.call(arguments);

    return function select(collection) {
        var newCollection = [];

        collection.forEach(function (note, index) {
            newCollection.push({});

            selectedFields.forEach(function (field) {
                if (note.hasOwnProperty(field) && note[field] !== undefined) {
                    newCollection[index][field] = note[field];
                }
            });
        });

        return newCollection;
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
                return firstNote[property] > secondNote[property];
            }

            return firstNote[property] < secondNote[property];
        });
    };
};

exports.format = function (property, formatter) {
    return function format(collection) {
        var newCollection = copyCollection(collection);

        newCollection.forEach(function (note) {
            if (note.hasOwnProperty(property)) {
                note[property] = formatter(note[property]);
            }
        });

        return newCollection;
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
            filters.forEach(function (filter) {
                newCollection = newCollection.concat(filter(collection));
            });

            return deleteRepeatElements(newCollection);
        };
    };

    exports.and = function () {
        var filters = [].slice.call(arguments);

        return function and(collection) {
            var newCollection = copyCollection(collection);

            filters.forEach(function (filter) {
                newCollection = filter(newCollection);
            });

            return newCollection;
        };
    };
}
