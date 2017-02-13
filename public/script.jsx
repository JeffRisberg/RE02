class Menu extends React.Component {
    render() {
        let menus = ['Home',
            'About',
            'Services',
            'Portfolio',
            'Contact us']
        return (
            <div>
                {menus.map((v, i) => {
                    return <div key={i}><Link label={v}/></div>
                })}
            </div>
        )
    }
}

class Link extends React.Component {
    render() {
        const url = '/'
            + this.props.label
                .toLowerCase()
                .trim()
                .replace(' ', '-')
        return <div>
            <a href={url}>
                {this.props.label}
            </a>
            <br/>
        </div>
    }
}

var Comment = React.createClass({
    render: function () {
        var datetimeStr = this.props.datetime;
        var datetime = parseInt(datetimeStr);
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return (
            <div className="comment">
                <span className="commentAuthor">
                    {this.props.author}&nbsp;&nbsp;
                    <em>on {moment(datetime).format("MM/DD/YYYY hh:mm:ss a")}</em>
                </span>
                <span dangerouslySetInnerHTML={{__html: rawMarkup}}/>
            </div>
        );
    }
});

/** Show the main display (list plus form) */
var CommentBox = React.createClass({
    loadCommentsFromServer: function () {
        var me = this;

        axios.get(this.props.url)
            .then(function (response) {
                me.setState({data: response.data});
            });
    },
    handleCommentSubmit: function (comment) {
        var me = this,
            comments = this.state.data;
        comments.push(comment);

        this.setState({data: comments}, function () {
            // `setState` accepts a callback. To avoid (improbable) race condition,
            // we'll send the ajax request right after we optimistically set the new state.
            axios.post(this.props.url, comment)
                .then(function (response) {
                    me.setState({data: response.data});
                });
        });
    },
    getInitialState: function () {
        return {data: []};
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function () {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data}/>
                <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment, index) {
            return (
                // `key` is a React-specific concept and is not mandatory for the
                // purpose of this tutorial. if you're curious, see more here:
                // http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
                <Comment author={comment.author} datetime={comment.datetime} key={index}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var author = ReactDOM.findDOMNode(this.refs.author).value.trim();
        var datetimeStr = ReactDOM.findDOMNode(this.refs.datetime).value.trim();
        var text = ReactDOM.findDOMNode(this.refs.text).value.trim();
        if (!text || !author) {
            return;
        }
        var datetime = parseInt(datetimeStr);
        this.props.onCommentSubmit({author: author, datetime: datetime, text: text});
        ReactDOM.findDOMNode(this.refs.author).value = '';
        ReactDOM.findDOMNode(this.refs.text).value = '';
    },
    render: function () {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author"/>
                <input type="text" placeholder="Say something..." ref="text"/>
                <input type="hidden" ref="datetime" value={moment()}/>
                <input type="submit" value="Post"/>
            </form>
        );
    }
});

/** Request the main rendering here */
ReactDOM.render(
    <div>
        <Menu/>
        <CommentBox url="comments.json" pollInterval={2000}/>
    </div>,
    document.getElementById('content')
);
