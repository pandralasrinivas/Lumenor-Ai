import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI, addressAPI } from "../utils/api";
import { setUser } from "../redux/authSlice";
import { User, MapPin, Edit2, Trash2 } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const response = await addressAPI.getAll();
        setAddresses(response.data.addresses || []);
      } catch (error) {
        console.error("Failed to load addresses", error);
      }
    };

    fetchAddresses();
  }, [user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      dispatch(setUser(response.data.user));
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await addressAPI.create({
        ...newAddress,
        isDefault: addresses.length === 0,
      });

      setAddresses([...addresses, response.data.address]);
      setNewAddress({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      });
      setShowAddressForm(false);
      toast.success("Address added successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await addressAPI.delete(addressId);
      setAddresses(addresses.filter((a) => a._id !== addressId));
      toast.success("Address deleted successfully");
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <User className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {user?.phone || "Not provided"}
                </p>
                <p>
                  <span className="font-semibold">Member Since:</span>{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Edit2 size={18} />
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2">First</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">Last</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    {isLoading ? "Updating..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <p>
                    <span className="font-medium">First Name:</span>{" "}
                    {user?.firstName}
                  </p>
                  <p>
                    <span className="font-medium">Last Name:</span>{" "}
                    {user?.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {user?.phone || "Not provided"}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Delivery Addresses</h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn btn-primary text-sm"
                >
                  {showAddressForm ? "Cancel" : "Add Address"}
                </button>
              </div>

              {showAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="mb-6 pb-6 border-b"
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            fullName: e.target.value,
                          })
                        }
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                        className="input"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block font-medium mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            street: e.target.value,
                          })
                        }
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">State</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            state: e.target.value,
                          })
                        }
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={newAddress.postalCode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postalCode: e.target.value,
                          })
                        }
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-2">Country</label>
                      <input
                        type="text"
                        value={newAddress.country}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            country: e.target.value,
                          })
                        }
                        className="input"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn btn-primary disabled:opacity-50"
                  >
                    {isLoading ? "Adding..." : "Add Address"}
                  </button>
                </form>
              )}

              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-blue-600" size={20} />
                          <p className="font-semibold">{address.fullName}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <p className="text-sm text-gray-700">
                        {address.street}, {address.city}, {address.state}{" "}
                        {address.postalCode}
                      </p>
                      <p className="text-sm text-gray-700">
                        {address.country} | {address.phone}
                      </p>

                      {address.isDefault && (
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          Default Address
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No addresses added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
