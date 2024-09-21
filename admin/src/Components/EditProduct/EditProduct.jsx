import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditProduct.css';

export const EditProduct = () => {
    const { id } = useParams();
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        new_price: "",
        old_price: ""
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:7000/allproducts`);
                if (!response.ok) throw new Error('Product not found');
                const products = await response.json();
                const product = products.find(prod => prod.id === Number(id));
                if (!product) throw new Error('Product not found');
                setProductDetails(product);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const updateProduct = async () => {
        setError('');
        let product = { ...productDetails };

        // Only append the image to FormData if a new image is provided
        let formData = new FormData();
        if (image) {
            formData.append('product', image);
        }

        try {
            // Upload image if it's provided
            let imageUploadResponse = null;
            if (image) {
                const uploadResponse = await fetch(`http://localhost:7000/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const responseData = await uploadResponse.json();

                if (responseData.success) {
                    product.image = responseData.image_url; // Use the new image URL
                } else {
                    throw new Error("Image upload failed");
                }
            }

            // Now update the product regardless of whether the image was changed or not
            const updateResponse = await fetch(`http://localhost:7000/updateproduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });
            const updateData = await updateResponse.json();

            if (updateData.success) {
                alert("Product Updated Successfully");
                navigate('/listproducts'); 
            } else {
                throw new Error("Failed to update product");
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className='edit-product'>
            <h1>Edit Product</h1>
            {loading ? <p>Loading...</p> : (
                <>
                    {error && <p className='error'>{error}</p>}
                    <div className="edit-product-form">
                        <div className="edit-product-field">
                            <label>Product Title</label>
                            <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder='Type here' />
                        </div>
                        <div className="edit-product-price">
                            <div className="edit-product-field">
                                <label>Old Price</label>
                                <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder='Type here' />
                            </div>
                            <div className="edit-product-field">
                                <label>New Price</label>
                                <input type="text" value={productDetails.new_price} onChange={changeHandler} name="new_price" placeholder='Type here' />
                            </div>
                        </div>
                        <div className="edit-product-field">
                            <label>Product Category</label>
                            <select value={productDetails.category} onChange={changeHandler} name="category">
                                <option value="women">Women</option>
                                <option value="men">Men</option>
                                <option value="kid">Kid</option>
                            </select>
                        </div>
                        <div className="edit-product-field">
                            <label>Product Image</label>
                            <div className="image-upload">
                                <label htmlFor="file-input" className="image-label">
                                    <img src={image ? URL.createObjectURL(image) : productDetails.image} alt="Product" className='editproduct-thumbnail-img' />
                                </label>
                                <input onChange={imageHandler} type="file" name='image' id='file-input' hidden />
                                <p className="upload-instruction">Click to upload a new image or drag & drop here</p>
                            </div>
                        </div>
                        <button onClick={updateProduct} className='editproduct-btn'>Update</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EditProduct;
