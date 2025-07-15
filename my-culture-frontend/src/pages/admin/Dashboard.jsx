import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const payload = {
      url: `${import.meta.env.VITE_BACKEND}/api/users`,
      config: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    };

    try {
      setLoading(true);
      axios
        .get(payload.url, payload.config)
        .then((res) => {
          setUsers(res.data);
        })
        .catch(() => {
          toast.error("Something went wrong. Please try again later.");
        });
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  {/*
  const fetchEvents = async () => {
    const payload = {
      url: `${import.meta.env.VITE_BACKEND}/api/events`,
      config: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    };

    try {
      setLoading(true);
      axios
        .get(payload.url, payload.config)
        .then((res) => {
          setEvents(res.data);
        })
        .catch(() => {
          toast.error("Something went wrong. Please try again later.");
        });
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
*/}

{/*
  const fetchSubscribers = async () => {
    const payload = {
      url: `${import.meta.env.VITE_BACKEND}/api/subscribers`,
      config: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    };

    try {
      setLoading(true);
      axios
        .get(payload.url, payload.config)
        .then((res) => {
          setSubscribers(res.data);
        })
        .catch(() => {
          toast.error("Something went wrong. Please try again later.");
        });
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
   */}

  useEffect(() => {
    void fetchUsers();

    return () => {};
  }, []);

  return (
    <section
      id="dashboard"
      className="flex flex-col items-center h-screen relative gap-4 px-4"
    >
      <div className="max-w-screen-xl w-full h-full flex flex-col justify-center items-center border-b-4 border-neutral p-4">
        <div className="relative max-w-1/2 h-auto p-10">
          <img src="/logoNew/MB_Sparkasse.png" alt="" className="" />
        </div>
      </div>

      <div className="max-w-screen-xl w-full h-auto flex flex-row flex-wrap justify-around items-center p-4 gap-4">
        {users && (
          <div className="flex flex-col justify-center items-center gap-4">
            <h2 className="text-2xl text-neutral opacity-80 font-bold">
              {t('admin.pages.usersCount', { count: users.totalCount })}
            </h2>
          </div>
        )}

        {/* 
        {events && (
          <div className="flex flex-col justify-center items-center gap-4">
            <h2 className="text-2xl text-neutral opacity-80 font-bold">Events: {events.totalCount}</h2>
          </div>
        )}
          */}

        {/* 
        {subscribers && (
          <div className="flex flex-col justify-center items-center gap-4">
            <h2 className="text-2xl text-neutral opacity-80 font-bold">Subscribers: {subscribers.totalCount}</h2>
          </div>
        )}
*/}
      </div>
    </section>
  );
};

export default Dashboard;
