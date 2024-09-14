import React from 'react'
import './DescriptionBox.css'

export const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>Welcome to Bazar, your go-to online destination for a seamless and exciting shopping experience. Explore our extensive selection of high-quality products, from the latest fashion and cutting-edge electronics to unique home décor and essential everyday items. Enjoy exclusive deals, effortless navigation, and a secure checkout, all designed to make your shopping experience enjoyable and stress-free. At Bazar, we are committed to providing exceptional value and customer satisfaction with every purchase. Discover the joy of shopping at Bazar today and find something special just for you!</p>
        </div>
    </div>
  )
}

export default DescriptionBox
