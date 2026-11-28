import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { FaEnvelope, FaPhone, FaUser, FaKey } from "react-icons/fa";
import { toast } from "react-toastify";
import { useForm } from 'react-hook-form';
import axios from 'axios';

const PersonalInfo = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    formState: { errors },
  } = useForm();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = {
        url: `${import.meta.env.VITE_BACKEND}/api/users/update`,
        data: {
          firstName: e.target[0].value,
          lastName: e.target[1].value,
          email: e.target[2].value,
          phoneNumber: e.target[3].value,
        },
        config: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      }

      await axios.put(
        payload.url,
        payload.data,
        payload.config
      );
      setUser({
        ...user,
        firstName: e.target[0].value,
        lastName: e.target[1].value,
        email: e.target[2].value,
        phoneNumber: e.target[3].value,
      });
      setIsEditing(false);
      toast.success("Änderungen erfolgreich gespeichert.");
    } catch (error) {
      toast.error("Fehler beim Speichern der Änderungen.");
    } finally {
      setLoading(false);
    }
  }

  const handlePasswordChange = (key, value) => {
    setPasswordData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        url: `${import.meta.env.VITE_BACKEND}/api/users/update`,
        data: {
          password: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        config: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      }
      await axios.put(
        payload.url,
        payload.data,
        payload.config
      );

      toast.success("Passwort erfolgreich geändert.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Fehler beim Ändern des Passworts.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full flex flex-col items-center text-gray-200 py-10 mt-24 z-10">
      <div className="max-w-screen-xl flex flex-col gap-20">
        {user && (
          <>
            <div className="relative flex flex-col w-full justify-between gap-y-6 p-10">
              <div className="absolute h-1/4 w-1/2 top-0 left-0 border-l-2 border-t-2 border-primary"></div>
              <div className="absolute h-1/4 w-1/2 bottom-0 right-0 border-r-2 border-b-2 border-primary z-0"></div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-100">
                Persönliche Informationen
              </h2>
              <form className="flex flex-col gap-6" onSubmit={onSubmit}>
                <label
                  htmlFor="firstName"
                  className="h-12 flex items-center gap-3 bg-neutral border border-primary px-3 py-2"
                > <FaUser className="text-gray-200 font-semibold text-2xl" /> <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  defaultValue={user.firstName}
                  {...register("firstName")}
                  disabled={!isEditing}
                  placeholder="Vorname"
                  className="w-full text-gray-200 disabled:opacity-75 bg-transparent placeholder-gray-400 focus:outline-none"
                /> </label> <label
                htmlFor="lastName"
                className="h-12 flex items-center gap-3 bg-neutral border border-primary px-3 py-2"
              > <FaUser className="text-gray-200 font-semibold text-2xl" /> <input
                id="lastName"
                name="lastName"
                type="text"
                defaultValue={user.lastName}
                {...register("lastName")}
                disabled={!isEditing}
                placeholder="Nachname"
                className="w-full bg-transparent text-gray-200 disabled:opacity-75 placeholder-gray-400 focus:outline-none"
              /> </label> <label
                htmlFor="userEmail"
                className="h-12 flex items-center gap-3 bg-neutral border border-primary px-3 py-2"
              > <FaEnvelope className="text-gray-200 text-2xl" /> <input
                id="userEmail"
                name="email"
                type="email"
                defaultValue={user.email}
                {...register("email", { required: true })}
                disabled
                className="w-full bg-transparent text-gray-200 disabled:opacity-75 placeholder-gray-400 focus:outline-none"
              /> </label> <label
                htmlFor="phoneNumber"
                className="h-12 flex items-center gap-3 bg-neutral border border-primary px-3 py-2"
              > <FaPhone className="text-gray-200 text-2xl" /> <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                defaultValue={user.phoneNumber}
                {...register("phoneNumber")}
                disabled={!isEditing}
                placeholder="Telefonnummer"
                className="w-full bg-transparent text-gray-200 disabled:opacity-75 placeholder-gray-400 focus:outline-none"
              /> </label>
                <div className="gap-4 mt-0 grid grid-cols-1 sm:grid-cols-2">
                  {isEditing ? (
                    <>
                      <button disabled={loading} className="btn btn-primary hover:btn-neutral border-2 hover:border-primary hover:border-2 rounded-none text-neutral hover:text-primary text-lg font-semibold w-full sm:w-auto z-10">
                        Speichern
                      </button>
                      <div
                        className="btn btn-primary hover:btn-neutral border-2 hover:border-primary hover:border-2 rounded-none text-neutral hover:text-primary text-lg font-semibold w-full sm:w-auto z-10"
                        onClick={() => {
                          setIsEditing(false);
                          toast.info("Änderungen verworfen.");
                        }}
                      >
                        Abbrechen
                      </div>
                    </>
                  ) : (
                    <div
                      className="btn btn-primary hover:btn-neutral border-2 hover:border-primary hover:border-2 rounded-none text-neutral hover:text-primary text-lg font-semibold w-full sm:w-auto z-10"
                      onClick={() => setIsEditing(true)}
                    >
                      Bearbeiten
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="relative w-full flex flex-col items-center text-gray-200 p-10">
              <div className="absolute h-1/4 w-1/2 top-0 left-0 border-l-2 border-t-2 border-primary"></div>
              <div className="absolute h-1/4 w-1/2 bottom-0 right-0 border-r-2 border-b-2 border-primary z-0"></div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-100">
                Passwort ändern
              </h3>
              <form
                onSubmit={handlePasswordSubmit}
                className="flex flex-col w-full justify-between gap-y-6"
              >
                <label
                  htmlFor="currentPassword"
                  className="h-12 flex items-center gap-3 bg-neutral border border-primary px-3 py-2"
                > <FaKey className="text-gray-200 font-semibold text-2xl" /> <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  min="8"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  placeholder="Aktuelles Passwort"
                  className="w-full bg-transparent text-gray-200 disabled:opacity-75 placeholder-gray-400 focus:outline-none"
                  required
                /> </label> <label
                htmlFor="newPassword"
                className="h-12 flex items-center gap-3 bg-neutral border border-primary px-3 py-2"
              > <FaKey className="text-gray-200 font-semibold text-2xl" /> <input
                id="newPassword"
                name="newPassword"
                type="password"
                min="8"
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
                placeholder="Neues Passwort"
                className="w-full bg-transparent text-gray-200 disabled:opacity-75 placeholder-gray-400 focus:outline-none"
                required
              /> </label> <label
                htmlFor="confirmPassword"
                className="h-12 flex items-center gap-3 bg-neutral border border-primary px-3 py-2"
              > <FaKey className="text-gray-200 font-semibold text-2xl" /> <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                min="8"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
                placeholder="Neues Passwort bestätigen"
                className="w-full bg-transparent text-gray-200 disabled:opacity-75 placeholder-gray-400 focus:outline-none"
                required
              /> </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary hover:btn-neutral border-2 hover:border-primary hover:border-2 rounded-none text-neutral hover:text-primary text-lg font-semibold w-full sm:w-auto z-10"
                >
                  Passwort ändern
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PersonalInfo;
