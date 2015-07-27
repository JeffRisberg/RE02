import React from 'react/addons';

/*
 * @class Item
 * @extends React.Component
 */
class Item extends React.Component {

    /*
     * @method shouldComponentUpdate
     * @returns {Boolean}
     */
    shouldComponentUpdate() {
        return React.addons.PureRenderMixin.shouldComponentUpdate.apply(this, arguments);
    }

    /*
     * @method render
     * @returns {JSX}
     */
    render() {
        return <div className="item col-md-3">
            <div className="row">
              <div className="col-md-9">{this.props.item.title}</div>
              <div className="col-md-3 text-right">${this.props.item.price}</div>
            </div>
            {this.props.item.description}
        </div>;
    }
}

// Prop types validation
Item.propTypes = {
    item: React.PropTypes.object.isRequired,
};

export default Item;
