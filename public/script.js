'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Menu = function (_React$Component) {
    _inherits(Menu, _React$Component);

    function Menu() {
        _classCallCheck(this, Menu);

        return _possibleConstructorReturn(this, (Menu.__proto__ || Object.getPrototypeOf(Menu)).apply(this, arguments));
    }

    _createClass(Menu, [{
        key: 'render',
        value: function render() {
            var menus = ['Home', 'About', 'Services', 'Portfolio', 'Contact us'];
            return React.createElement(
                'div',
                null,
                menus.map(function (v, i) {
                    return React.createElement(
                        'div',
                        { key: i },
                        React.createElement(Link, { label: v })
                    );
                })
            );
        }
    }]);

    return Menu;
}(React.Component);

var Link = function (_React$Component2) {
    _inherits(Link, _React$Component2);

    function Link() {
        _classCallCheck(this, Link);

        return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
    }

    _createClass(Link, [{
        key: 'render',
        value: function render() {
            var url = '/' + this.props.label.toLowerCase().trim().replace(' ', '-');
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'a',
                    { href: url },
                    this.props.label
                ),
                React.createElement('br', null)
            );
        }
    }]);

    return Link;
}(React.Component);

var Comment = React.createClass({
    displayName: 'Comment',

    render: function render() {
        var datetimeStr = this.props.datetime;
        var datetime = parseInt(datetimeStr);
        var rawMarkup = marked(this.props.children.toString(), { sanitize: true });
        return React.createElement(
            'div',
            { className: 'comment' },
            React.createElement(
                'span',
                { className: 'commentAuthor' },
                this.props.author,
                '\xA0\xA0',
                React.createElement(
                    'em',
                    null,
                    'on ',
                    moment(datetime).format("MM/DD/YYYY hh:mm:ss a")
                )
            ),
            React.createElement('span', { dangerouslySetInnerHTML: { __html: rawMarkup } })
        );
    }
});

/** Show the main display (list plus form) */
var CommentBox = React.createClass({
    displayName: 'CommentBox',

    loadCommentsFromServer: function loadCommentsFromServer() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({ data: data });
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function handleCommentSubmit(comment) {
        var comments = this.state.data;
        comments.push(comment);
        this.setState({ data: comments }, function () {
            // `setState` accepts a callback. To avoid (improbable) race condition,
            // we'll send the ajax request right after we optimistically set the new state.
            $.ajax({
                url: this.props.url,
                dataType: 'json',
                type: 'POST',
                data: comment,
                success: function (data) {
                    this.setState({ data: data });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        });
    },
    getInitialState: function getInitialState() {
        return { data: [] };
    },
    componentDidMount: function componentDidMount() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'commentBox' },
            React.createElement(
                'h1',
                null,
                'Comments'
            ),
            React.createElement(CommentList, { data: this.state.data }),
            React.createElement(CommentForm, { onCommentSubmit: this.handleCommentSubmit })
        );
    }
});

var CommentList = React.createClass({
    displayName: 'CommentList',

    render: function render() {
        var commentNodes = this.props.data.map(function (comment, index) {
            return (
                // `key` is a React-specific concept and is not mandatory for the
                // purpose of this tutorial. if you're curious, see more here:
                // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
                React.createElement(
                    Comment,
                    { author: comment.author, datetime: comment.datetime, key: index },
                    comment.text
                )
            );
        });
        return React.createElement(
            'div',
            { className: 'commentList' },
            commentNodes
        );
    }
});

var CommentForm = React.createClass({
    displayName: 'CommentForm',

    handleSubmit: function handleSubmit(e) {
        e.preventDefault();
        var author = ReactDOM.findDOMNode(this.refs.author).value.trim();
        var datetimeStr = ReactDOM.findDOMNode(this.refs.datetime).value.trim();
        var text = ReactDOM.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
            return;
        }
        var datetime = parseInt(datetimeStr);
        this.props.onCommentSubmit({ author: author, datetime: datetime, text: text });
        ReactDOM.findDOMNode(this.refs.author).value = '';
        ReactDOM.findDOMNode(this.refs.text).value = '';
    },
    render: function render() {
        return React.createElement(
            'form',
            { className: 'commentForm', onSubmit: this.handleSubmit },
            React.createElement('input', { type: 'text', placeholder: 'Your name', ref: 'author' }),
            React.createElement('input', { type: 'text', placeholder: 'Say something...', ref: 'text' }),
            React.createElement('input', { type: 'hidden', ref: 'datetime', value: moment() }),
            React.createElement('input', { type: 'submit', value: 'Post' })
        );
    }
});

/** Request the main rendering here */
ReactDOM.render(React.createElement(CommentBox, { url: 'comments.json', pollInterval: 2000 }), document.getElementById('content'));
