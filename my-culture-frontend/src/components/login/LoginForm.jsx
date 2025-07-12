import { useUser } from '../../contexts/UserContext.jsx';
import { useForm } from 'react-hook-form';
import { FaX, FaEnvelope, FaKey } from 'react-icons/fa6';

const LoginForm = () => {
  const { login } = useUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    document.getElementById('login-form').close();
    login(data);
    reset();
  };

  return (
    <dialog id="login-form" className="modal card">
      <div className="modal-box rounded-none bg-neutral border-4 border-primary">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-gray-200"><FaX className="font-bold text-2xl" /></button>
        </form>
        <form className="card-body p-4 sm:p-14 gap-4" onSubmit={handleSubmit(onSubmit)}>
          <img src="" alt="" className="mb-10" />
          <label htmlFor="email" className="input input-bordered flex items-center gap-2 rounded-none border border-primary hover:border-primary focus-within:border-primary bg-neutral">
            <FaEnvelope className="text-gray-200 font-semibold text-2xl" />
            <input id="email" name="email" type="email" autoComplete="email" placeholder="E-Mail-Address" className="grow font-semibold text-gray-200" defaultValue="" required {...register("email", { required: true })} />
          </label>
          <label htmlFor="password" className="input input-bordered flex items-center gap-2 rounded-none border border-primary hover:border-primary focus-within:border-primary bg-neutral">
            <FaKey className="text-gray-200 font-semibold text-2xl" />
            <input id="password" name="password" type="password" placeholder="Passwort" className="grow font-semibold text-gray-200" autoComplete="off" defaultValue="" required minLength="8" {...register("password", { required: true })} />
          </label>
          <div className="flex flex-col mt-6">
            <button className="btn btn-primary rounded-none text-semibold text-xl">Anmelden</button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default LoginForm;
