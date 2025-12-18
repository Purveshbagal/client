import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error('Registration failed!');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block">Name</label>
          <input
            type="text"
            {...register('name', { required: true })}
            className="border p-2 w-full"
          />
          {errors.name && <p className="text-red-500">Name is required</p>}
        </div>
        <div className="mb-4">
          <label className="block">Email</label>
          <input
            type="email"
            {...register('email', { required: true })}
            className="border p-2 w-full"
          />
          {errors.email && <p className="text-red-500">Email is required</p>}
        </div>
        <div className="mb-4">
          <label className="block">Password</label>
          <input
            type="password"
            {...register('password', { required: true, minLength: 6 })}
            className="border p-2 w-full"
          />
          {errors.password && <p className="text-red-500">Password must be at least 6 characters</p>}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full">Register</button>
      </form>
    </div>
  );
};

export default Register;
