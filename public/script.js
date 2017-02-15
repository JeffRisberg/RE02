class Menu extends React.Component {
    render() {
        let menus = ['Home', 'About', 'Services', 'Portfolio', 'Contact Us'];
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

class Comment extends React.Component {
    render() {
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
}

/** Show the main display (list plus form) */
class CommentBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };

        this.loadCommentsFromServer = this.loadCommentsFromServer.bind(this);
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
    }

    loadCommentsFromServer() {
        var me = this;

        axios.get(this.props.url).then(function (response) {
            me.setState({ data: response.data });
        });
    }

    handleCommentSubmit(comment) {
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
    }

    componentDidMount() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    }

    render() {
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
}

class CommentList extends React.Component {
    render() {
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
}

class CommentForm extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
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
    }

    render() {
        return React.createElement(
            'form',
            { className: 'commentForm', onSubmit: this.handleSubmit },
            React.createElement('input', { type: 'text', placeholder: 'Your name', ref: 'author' }),
            React.createElement('input', { type: 'text', placeholder: 'Say something...', ref: 'text' }),
            React.createElement('input', { type: 'hidden', ref: 'datetime', value: moment() }),
            React.createElement('input', { type: 'submit', value: 'Post' })
        );
    }
}

class Tooltip extends React.Component {
    constructor(props) {
        super(props);
        this.state = { opacity: false };
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        const tooltipNode = ReactDOM.findDOMNode(this);
        this.setState({
            opacity: !this.state.opacity,
            top: tooltipNode.offsetTop,
            left: tooltipNode.offsetLeft
        });
    }

    render() {
        const style = {
            zIndex: this.state.opacity ? 1000 : -1000,
            opacity: +this.state.opacity,
            top: (this.state.top || 0) + 20,
            left: (this.state.left || 0) - 30
        };
        return React.createElement(
            'div',
            { style: { display: 'inline' } },
            React.createElement(
                'span',
                { style: { color: 'blue' }, onMouseEnter: this.toggle, onMouseOut: this.toggle },
                this.props.children
            ),
            React.createElement(
                'div',
                { className: 'tooltip bottom', style: style, role: 'tooltip' },
                React.createElement('div', { className: 'tooltip-arrow' }),
                React.createElement(
                    'div',
                    { className: 'tooltip-inner' },
                    this.props.text
                )
            )
        );
    }
}

/** Request the main rendering here */
ReactDOM.render(React.createElement(
    'div',
    null,
    React.createElement(Menu, null),
    React.createElement(
        'div',
        null,
        React.createElement(
            Tooltip,
            { text: 'Master Express.js-The Node.js Framework For Your Web Development' },
            'Pro Express.js'
        ),
        'was published in 2014. It was one of the first books on v4.x. And it was my second book published with Apress after ',
        React.createElement(
            Tooltip,
            {
                text: 'Practical Node.js: Building Real-World Scalable Web Apps' },
            'Practical Node.js'
        ),
        '. The main focus of this post is to compare the four Node.js/Io.js frameworks: ',
        React.createElement(
            Tooltip,
            {
                text: 'HTTP API server' },
            'Hapi'
        ),
        ', ',
        React.createElement(
            Tooltip,
            { text: 'Release the Kraken!' },
            'Kraken'
        ),
        ', ',
        React.createElement(
            Tooltip,
            {
                text: 'Sail away' },
            'Sails.js'
        ),
        ' and ',
        React.createElement(
            Tooltip,
            { text: 'IBM of frameworks' },
            'Loopback'
        ),
        '. There are many other frameworks to consider, but I had to draw the line somewhere.'
    ),
    React.createElement(CommentBox, { url: 'comments.json', pollInterval: 2000 })
), document.getElementById('content'));
