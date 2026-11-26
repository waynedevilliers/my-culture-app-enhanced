import Protected from "@/routes/Protected.jsx";
import Profile from "@/views/Profile.jsx";

export default function Page() {
  return (
    <Protected>
      <Profile />
    </Protected>
  );
}
