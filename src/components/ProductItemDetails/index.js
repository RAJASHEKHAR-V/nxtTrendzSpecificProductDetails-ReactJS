import {Component} from 'react'
// import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  progress: 'IS_IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    specificProductDetailObject: {},
    count: 1,
    apiStatus: apiConstants.initial,
    errorMessage: '',
  }

  // calling getSpecificProducts() to fetch the specific product details from mount method
  componentDidMount() {
    this.getSpecificProducts()
  }

  // updating state with specific product details along with api status as "SUCCESS" to display the details.
  updateStateWithData = data => {
    const specificProductDetails = {
      id: data.id,
      imageUrl: data.image_url,
      title: data.title,
      price: data.price,
      description: data.description,
      brand: data.brand,
      totalReviews: data.total_reviews,
      rating: data.rating,
      availability: data.availability,
    }
    const similarProducts = data.similar_products.map(eachProduct => ({
      id: eachProduct.id,
      imageUrl: eachProduct.image_url,
      title: eachProduct.title,
      style: eachProduct.style,
      price: eachProduct.price,
      description: eachProduct.description,
      brand: eachProduct.brand,
      totalReviews: eachProduct.total_reviews,
      rating: eachProduct.rating,
      availability: eachProduct.availability,
    }))
    console.log(similarProducts)
    this.setState({
      specificProductDetailObject: {specificProductDetails, similarProducts},
      apiStatus: apiConstants.success,
    })
  }

  // To show loading and fetching specific product details updating state as per the response.
  getSpecificProducts = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    this.setState({apiStatus: apiConstants.progress})
    const url = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    const data = await response.json()
    console.log(data)
    if (response.ok === true) {
      this.updateStateWithData(data)
    } else if (response.status === 404) {
      this.setState({
        apiStatus: apiConstants.failure,
        errorMessage: data.error_msg,
      })
    }
  }

  loadLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  onContinueShopping = () => {
    const {history} = this.props
    history.replace('/products')
  }

  getFailureStatus = () => {
    const {errorMessage} = this.state

    return (
      <div className="specific-product-failure-card">
        <img
          src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
          className="specific-product-failure-image"
          alt="failure view"
        />
        <h1 className="specific-product-failure-heading">{errorMessage}</h1>
        <div>
          <button
            className="continue-shopping-button"
            type="submit"
            onClick={this.onContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  onMinusButton = () => {
    const {count} = this.state
    if (count > 1) {
      this.setState(pervState => ({count: pervState.count - 1}))
    }
  }

  onPlusButton = () => {
    this.setState(pervState => ({count: pervState.count + 1}))
  }

  getSuccessProductDetails = () => {
    const {specificProductDetailObject, count} = this.state
    const {
      specificProductDetails,
      similarProducts,
    } = specificProductDetailObject
    const {
      imageUrl,
      title,
      price,
      description,
      brand,
      totalReviews,
      rating,
      availability,
    } = specificProductDetails

    return (
      <div className="specific-product-body">
        <div className="specific-product-card">
          <img
            src={imageUrl}
            className="specific-product-image"
            alt="product"
          />
          <div className="specific-product-details">
            <h1 className="specific-product-title">{title}</h1>
            <p className="specific-product-price">Rs {price}</p>
            <div className="specific-product-rating-views-card">
              <div className="specific-product-rating-card">
                <p className="specific-product-rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  className="specific-product-start-image"
                  alt="star"
                />
              </div>
              <p className="specific-product-views">{totalReviews} Reviews</p>
            </div>
            <p className="specific-product-description">{description}</p>
            <p className="specific-product-availability">
              <span className="availability-span">Availability: </span>
              {availability}
            </p>
            <p className="specific-product-brand">
              <span className="brand-span">Brand: </span>
              {brand}
            </p>
            <hr className="break-line" />
            <div className="add-to-cart-buttons-card">
              <div>
                <button
                  className="minus-icon-button"
                  type="submit"
                  data-testid="minus"
                  onClick={this.onMinusButton}
                >
                  <BsDashSquare className="minus-icon" />
                </button>
              </div>
              <p className="add-cart-count">{count}</p>
              <div>
                <button
                  className="plus-icon-button"
                  type="submit"
                  data-testid="plus"
                  onClick={this.onPlusButton}
                >
                  <BsPlusSquare className="plus-icon" />
                </button>
              </div>
            </div>
            <div>
              <button className="add-to-cart-button" type="submit">
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
        <h1 className="similar-product-heading">Similar Products</h1>
        <ul className="similar-product-card">
          {similarProducts.map(eachSimilarProduct => (
            <SimilarProductItem
              key={eachSimilarProduct.id}
              similarProductDetails={eachSimilarProduct}
            />
          ))}
        </ul>
      </div>
    )
  }

  getSpecificProductsToRender = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiConstants.success:
        return this.getSuccessProductDetails()
      case apiConstants.failure:
        return this.getFailureStatus()
      case apiConstants.progress:
        return this.loadLoader()
      default:
        return null
    }
  }

  render() {
    console.log('hi')
    return (
      <div className="product-item-container">
        <Header />
        {this.getSpecificProductsToRender()}
      </div>
    )
  }
}

export default ProductItemDetails
