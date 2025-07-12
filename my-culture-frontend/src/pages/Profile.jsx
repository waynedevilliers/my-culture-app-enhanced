import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import PersonalInfo from "../components/profile/PersonalInfo.jsx";
import NewsletterSubscription from "../components/profile/NewsletterSubscription.jsx";
import EventsYouMayLike from "../components/profile/EventsYouMayLike.jsx";
import { RowsPhotoAlbum } from 'react-photo-album';
import impressions from '../utils/impressions.ts';

const Profile = () => {
  return (
    <main id="profile" className="relative bg-neutral text-gray-200 flex flex-col justify-center items-center">
      <figure className="absolute w-screen h-full z-0 overflow-hidden opacity-5">
        <RowsPhotoAlbum
          targetRowHeight={200}
          rowConstraints={{ singleRowMaxHeight: 250 }}
          photos={impressions}
          componentsProps={() => ({ image: { loading: "eager", decoding: "sync" }})}
        />
      </figure>
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row px-4 z-10">
        <aside className="w-full lg:w-1/3 mt-24 z-10">
          <ProfileHeader />
          <EventsYouMayLike />
        </aside>
        <section className="flex-1 flex flex-col gap-8 p-6 z-10">
          <PersonalInfo />
          <NewsletterSubscription />
        </section>
      </div>
    </main>
  );
};

export default Profile;
