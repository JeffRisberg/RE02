class Menu extends React.Component {
    render() {
        let menus = ['Home', 'About', 'Services', 'Portfolio', 'Contact us'];
        return React.createElement(
            'div',
            null,
            menus.map((v, i) => {
                return React.createElement(
                    'div',
                    { key: i },
                    React.createElement(Link, { label: v })
                );
            })
        );
    }
}

class Link extends React.Component {
    render() {
        const url = '/' + this.props.label.toLowerCase().trim().replace(' ', '-');
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
}

var Comment = React.createClass({
    displayName: 'Comment',

    render: function () {
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

    loadCommentsFromServer: function () {
        var me = this;

        axios.get(this.props.url).then(function (response) {
            me.setState({ data: response.data });
        });
    },
    handleCommentSubmit: function (comment) {
        var me = this,
            comments = this.state.data;
        comments.push(comment);

        this.setState({ data: comments }, function () {
            // `setState` accepts a callback. To avoid (improbable) race condition,
            // we'll send the ajax request right after we optimistically set the new state.
            axios.post(this.props.url, comment).then(function (response) {
                me.setState({ data: response.data });
            });
        });
    },
    getInitialState: function () {
        return { data: [] };
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function () {
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

    render: function () {
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

    handleSubmit: function (e) {
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
    render: function () {
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
ReactDOM.render(React.createElement(
    'div',
    null,
    React.createElement(Menu, null),
    React.createElement(CommentBox, { url: 'comments.json', pollInterval: 2000 })
), document.getElementById('content'));
