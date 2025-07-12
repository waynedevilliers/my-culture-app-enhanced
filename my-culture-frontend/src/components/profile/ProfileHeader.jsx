import { useUser } from "../../contexts/UserContext";
import { FaUserAlt } from "react-icons/fa";

const ProfileHeader = () => {
  const { user } = useUser();

  return (
    <aside className="flex flex-col items-center gap-6 mt-24">
      {user && (
        <>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary bg-slate-900">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profilbild"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white flex justify-center items-center h-full">
                <FaUserAlt className="text-4xl" />
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-primary text-center">
            Willkommen, {user.firstName}!
          </h1>
          <p className="text-lg text-gray-400 text-center">
            Verwalten Sie Ihre persönlichen Informationen und Vorlieben unten.
          </p>
        </>
      )}
    </aside>
  );
};

export default ProfileHeader;
