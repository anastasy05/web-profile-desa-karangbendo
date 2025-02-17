'use client';
import Button from '@/components/button/Button';
import Card from '@/components/cards/Card';
import { InputForm } from '@/components/forms/InputForm';
import LabelForm from '@/components/forms/LabelForm';
import { SelectForm } from '@/components/forms/SelectForm';
import { Position } from '@/types/Position';
import { User } from '@/types/User';
import axiosInstance from '@/utils/axiosInstance';
import { formatText } from '@/utils/format';
import { optionPosition, optionRole } from '@/utils/option';
import { yupResolver } from '@hookform/resolvers/yup';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as yup from 'yup';

export default function TableAdmin() {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [positions, setPositions] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userSchema = yup.object().shape({
    name: yup.string().required('Nama wajib diisi'),
    email: yup
      .string()
      .email('Format email tidak valid')
      .required('Email wajib diisi'),
    phone: yup.string().required('Nomor telepon wajib diisi'),
    password: yup
      .string()
      .min(8, 'Password minimal 8 karakter')
      .required('Password wajib diisi'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Konfirmasi password harus sesuai'),
    verified: yup.date().nullable(),
    position: yup.string().required('Jabatan wajib diisi'),
    role: yup
      .mixed<'admin' | 'umkm'>()
      .oneOf(['admin', 'umkm'], 'Role tidak valid'),
  });
  const [type, setType] = useState<'add' | 'edit'>('add');
  const [id, setId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      position: '',
    },
  });

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/users');
      const dataTemporary: User[] = response.data.data;

      const positionResponse = await axiosInstance.get('/positions');
      const positionsData: Position[] = positionResponse.data.data;
      const dataPositions = positionsData.map((item) => ({
        label: item.name,
        value: item.name,
      }));

      setPositions(dataPositions);
      setAccounts(dataTemporary);
    } catch (error) {
      console.log(`Error fetching data akun admin: ${error}`);
    }
  };

  const handleAddUser = async (data: any) => {
    try {
      setIsLoading(true);
      delete data.confirmPassword;
      let response;
      if (data.position == '') data.position = null;
      if (!id) {
        response = await axiosInstance.post('/users', {
          ...data,
          role: 'admin',
        });
      } else {
        response = await axiosInstance.put(`users/${id}`, {
          ...data,
          role: 'admin',
        });
      }
      if (response.status) {
        close();
        if (!id) {
          Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Sukses tambah data akun admin',
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Sukses update data akun admin',
          });
        }
        fetchData();
      } else {
        close();
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: response.data.message[0] || 'Terjadi kesalahan.',
        });
      }

      setIsLoading(false);
    } catch (error: any) {
      close();
      setIsLoading(false);

      if (error.response) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: error.response.data.message || 'Terjadi kesalahan.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan tak terduga.',
        });
      }
      console.log(`Error create data akun admin: ${error}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Sukses!',
          text: 'Sukses menghapus data akun admin',
        });
        fetchData();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: response.data.message || 'Terjadi kesalahan.',
        });
      }
    } catch (error: any) {
      if (error.response) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: error.response.data.message || 'Terjadi kesalahan.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: 'Terjadi kesalahan tak terduga.',
        });
      }
      console.log(`Error delete data akun admin: ${error}`);
    }
  };

  const modalClick = () => {
    const modal = document.getElementById(`modal_${type}`) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  type FormFields = Pick<
    User,
    'name' | 'role' | 'email' | 'phone' | 'password' | 'verified' | 'position'
  >;

  const handleEdit = (data: FormFields) => {
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as keyof FormFields, value);
    });
  };

  const close: any = () => {
    const modal = document.getElementById(`modal_${type}`) as HTMLDialogElement;
    if (id) {
      setId(null);
    }
    if (modal) {
      modal.close();
      reset();
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) modalClick();
  }, [type, isModalOpen]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <div className="flex justify-between items-center mb-3">
        <p className="font-bold">Daftar Akun Admin</p>
        <button
          type="button"
          onClick={() => {
            setType('add');
            setIsModalOpen(true);
            setValue('role', 'admin');
          }}
          className="w-max px-3 py-2 bg-primary rounded-md text-white text-sm font-medium gap-2 flex justify-center items-center"
        >
          <IconPlus color="#fff" size={18} />
          <p>Tambah Data</p>
        </button>
      </div>
      <dialog id={`modal_${type}`} className="modal">
        <div className="modal-box">
          <button
            type="button"
            onClick={close}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>

          <h3 className="font-bold text-lg">
            {type == 'add' ? 'Tambah' : 'Edit'} Akun Admin
          </h3>

          <form
            method="post"
            onSubmit={handleSubmit(handleAddUser)}
            className="mt-3 flex flex-col gap-2"
          >
            <LabelForm label="Nama">
              <InputForm
                {...register('name')}
                type="text"
                label="Nama"
                name="name"
                placeholder="Input nama admin"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </LabelForm>

            <LabelForm label="Email">
              <InputForm
                {...register('email')}
                type="text"
                label="Email"
                name="email"
                placeholder="Input email admin"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </LabelForm>

            <LabelForm label="Nomor Telepon">
              <InputForm
                {...register('phone')}
                type="text"
                label="Nomor Telepon"
                name="phone"
                placeholder="Input nomor telepon admin"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </LabelForm>

            <LabelForm label="Password">
              <InputForm
                {...register('password')}
                type="password"
                label="Password"
                name="password"
                placeholder="Input password admin"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </LabelForm>

            <LabelForm label="Konfirmasi Password">
              <InputForm
                {...register('confirmPassword')}
                type="password"
                label="Konfirmasi Password"
                name="confirmPassword"
                placeholder="Input konfirmasi password admin"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </LabelForm>

            <LabelForm label="Jabatan">
              <SelectForm
                {...register('position')}
                label="Jabatan"
                name="position"
                data={positions}
                onChange={(e: any) => setRole(e.target.value)}
              />
              {errors.position && (
                <p className="text-red-500 text-sm">
                  {errors.position.message}
                </p>
              )}
            </LabelForm>

            <Button
              type="submit"
              color="primary"
              size="base"
              disable={isLoading}
            >
              {isLoading ? 'Loading...' : 'Save'}
            </Button>
          </form>
        </div>
      </dialog>
      <div className="overflow-x-auto rounded-md">
        <table className="table-auto w-full text-left">
          <thead className="bg-primary text-white">
            <tr>
              <th className="text-center p-3">NO</th>
              <th>NAMA</th>
              <th>EMAIL</th>
              <th>JABATAN</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody className="bg-second font-medium">
            {accounts.filter(
              (account: User, i: number) => account.role != 'umkm',
            ).length > 0 ? (
              accounts
                .filter((account: User, i: number) => account.role != 'umkm')
                .map((account: User, i: number) => (
                  <tr key={i}>
                    <td className="text-center p-3">{i + 1}</td>
                    <td>{account.name}</td>
                    <td>{account.email}</td>
                    <td>
                      {account.position ? formatText(account.position) : '-'}
                    </td>
                    <td className="space-x-2">
                      <Button
                        onClick={() => {
                          handleEdit(account);
                          setType('edit');
                          setId(account.id);
                          setIsModalOpen(true);
                        }}
                        color="warning"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          Swal.fire({
                            title: 'Apakah anda yakin akan menghapus data ini?',
                            showDenyButton: true,
                            confirmButtonText: 'Yakin',
                            denyButtonText: 'Tidak yakin',
                          }).then((result) => {
                            if (result.isConfirmed) {
                              return handleDelete(account.id);
                            }
                          });
                        }}
                        color="danger"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center font-medium py-3">
                  Data sedang kosong...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
