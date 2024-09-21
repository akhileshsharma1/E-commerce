import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ListProduct.css';
import cross_icon from '../../Assets/cross_icon.png';
import edit_icon from '../../Assets/edit_icon.png'; // Add your edit icon here

export const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const navigate = useNavigate(); // Initialize the navigate function

  const fetchInfo = async () => {
    await fetch('http://localhost:7000/allproducts')
      .then((res) => res.json())
      .then((data) => { setAllProducts(data) });
  }

  useEffect(() => {
    fetchInfo();
  }, [])

  const remove_product = async (id) => {
    await fetch('http://localhost:7000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id })
    });
    await fetchInfo();
  }

  const edit_product = (id) => {
    navigate(`/edit-product/${id}`); 
  }

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Edit</p> 
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return (
            <div key={index} className="listproduct-format-main listproduct">
              <img src={product.image} alt="" className="listproduct-product-icon" />
              <p>{product.name}</p>
              <p>Rs {product.old_price}</p>
              <p>Rs {product.new_price}</p>
              <p>{product.category}</p>
              <img onClick={() => { edit_product(product.id) }} src={edit_icon} alt="Edit" className="listproduct-edit-icon" />
              <img onClick={() => { remove_product(product.id) }} src={cross_icon} alt="Remove" className="listproduct-remove-icon" />
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default ListProduct;
