"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Serializer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slate = require("slate");

var _immutable = require("immutable");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var String = new _immutable.Record({
  object: "string",
  text: ""
});

var Serializer = exports.Serializer = function () {
  function Serializer(options) {
    _classCallCheck(this, Serializer);

    this.rules = options.rules;
  }

  _createClass(Serializer, [{
    key: "serialize",
    value: function serialize(value) {
      return this.serializeNode(value.document);
    }
  }, {
    key: "serializeNode",
    value: function serializeNode(node) {
      var _this = this;

      if (node.object === "text") {
        var leaves = node.getLeaves();
        return leaves.map(function (leaf) {
          return _this.serializeLeaf(leaf);
        }).toArray();
      }

      var children = node.nodes.map(function (node) {
        return _this.serializeNode(node);
      }).reduce(function (acc, value) {
        if (Array.isArray(value)) {
          return [].concat(_toConsumableArray(acc), _toConsumableArray(value));
        } else if (value != null) {
          return [].concat(_toConsumableArray(acc), [value]);
        } else {
          return acc;
        }
      }, []);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rule = _step.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(node, children);
          if (ret === null) return;
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      throw new Error("No serialize rule found for " + node.object + " node with type " + node.type);
    }
  }, {
    key: "serializeLeaf",
    value: function serializeLeaf(leaf) {
      var _this2 = this;

      var string = new String({ text: leaf.text });
      var text = this.serializeString(string);

      return leaf.marks.reduce(function (child, node) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _this2.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var rule = _step2.value;

            if (!rule.serialize) continue;
            var ret = rule.serialize(node, [child]);
            if (ret === null) return;
            if (ret) return ret;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        throw new Error("No serialize rule found for mark with type " + node.type);
      }, text);
    }
  }, {
    key: "serializeString",
    value: function serializeString(string) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var rule = _step3.value;

          if (!rule.serialize) continue;
          var ret = rule.serialize(string);
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      throw new Error("No serialize rule found for string");
    }
  }, {
    key: "deserialize",
    value: function deserialize(node) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _options$toJSON = options.toJSON,
          toJSON = _options$toJSON === undefined ? false : _options$toJSON;


      var document = this.deserializeNode(node);
      var json = { object: "value", document: document };
      return toJSON ? json : _slate.Value.fromJSON(json);
    }
  }, {
    key: "deserializeNode",
    value: function deserializeNode(node) {
      var _this3 = this;

      var next = function next(nodes) {
        return nodes.reduce(function (acc, node) {
          var ret = _this3.deserializeNode(node);

          if (ret == null) {
            return acc;
          } else if (Array.isArray(ret)) {
            return [].concat(_toConsumableArray(acc), _toConsumableArray(ret));
          } else {
            return [].concat(_toConsumableArray(acc), [ret]);
          }
        }, []);
      };

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.rules[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var rule = _step4.value;

          if (!rule.deserialize) continue;
          var ret = rule.deserialize(node, next);

          if (ret === undefined) {
            continue;
          } else if (ret === null) {
            return null;
          } else if (ret.object === "mark") {
            return this.deserializeMark(ret);
          } else {
            return ret;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      throw new Error("No deserialize rule found for " + node.object + " node with type " + node.type);
    }
  }, {
    key: "deserializeMark",
    value: function deserializeMark(mark) {
      var type = mark.type,
          data = mark.data;


      var applyMark = function applyMark(node) {
        if (node.object == "text") {
          node.leaves = node.leaves.map(function (leaf) {
            leaf.marks = leaf.marks || [];
            leaf.marks.push({ type: type, data: data });
            return leaf;
          });
        } else if (node.nodes) {
          node.nodes = node.nodes.map(applyMark);
        }

        return node;
      };

      return mark.nodes.reduce(function (nodes, node) {
        var ret = applyMark(node);
        return Array.isArray(ret) ? [].concat(_toConsumableArray(nodes), _toConsumableArray(ret)) : [].concat(_toConsumableArray(nodes), [ret]);
      }, []);
    }
  }]);

  return Serializer;
}();