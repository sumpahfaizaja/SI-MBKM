'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { ChevronLeft, Save, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Cookies from 'js-cookie';

// API Base URL
const API_BASE_URL = 'https://backend-si-mbkm.vercel.app/api';

// Type definitions
interface Student {
  NIM: string;
  nama_mahasiswa: string;
  semester: number;
  id_program_mbkm: string;
  NIP_dosbing: string;
}

interface Program {
  id_program_mbkm: number;
  company: string;
  role: string;
}

interface Dosen {
  NIP_dosbing: number;
  nama_dosbing: string;
}

const EditMahasiswaPage = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const NIM = params.id as string;

  const [student, setStudent] = useState<Student>({
    NIM: '',
    nama_mahasiswa: '',
    semester: 1,
    id_program_mbkm: '',
    NIP_dosbing: '',
  });

  const [programs, setPrograms] = useState<Program[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard-koordinator' },
    { title: 'Data Mahasiswa', link: '/dashboard-koordinator/mahasiswa' },
    { title: 'Edit Mahasiswa', link: `/dashboard-koordinator/mahasiswa/${NIM}/edit` },
  ];

  const getAuthToken = () => Cookies.get('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, programsRes, dosensRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/mahasiswa/${NIM}`),
          axios.get(`${API_BASE_URL}/program-mbkm`),
          axios.get(`${API_BASE_URL}/dosbing`),
        ]);

        const studentData = studentRes.data as Student;

        setStudent({
          ...studentData,
          id_program_mbkm: studentData.id_program_mbkm?.toString() || '',
          NIP_dosbing: studentData.NIP_dosbing?.toString() || '',
        });
        setPrograms(programsRes.data as Program[]);
        setDosens(dosensRes.data as Dosen[]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data.');
        setLoading(false);
      }
    };

    if (NIM) fetchData();
  }, [NIM]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setStudent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const updatedStudent: Partial<Student> = {
      ...student,
      id_program_mbkm: student.id_program_mbkm
        ? student.id_program_mbkm.toString() // Konversi menjadi string
        : undefined, // Ubah null menjadi undefined
      NIP_dosbing: student.NIP_dosbing
        ? student.NIP_dosbing.toString() // Konversi menjadi string
        : undefined, // Ubah null menjadi undefined
    };
  
    try {
      const token = getAuthToken();
      await axios.put(
        `${API_BASE_URL}/mahasiswa/${student.NIM}`,
        updatedStudent,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setSuccessMessage('Mahasiswa berhasil diperbarui!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Gagal memperbarui data mahasiswa');
      console.error('Error updating student:', err);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <PageContainer scrollable>
      <div className="flex flex-col gap-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Link href="/dashboard-koordinator/mahasiswa" className="rounded-full p-2 hover:bg-gray-100">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">Edit Data Mahasiswa</h1>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 rounded-lg bg-green-100 text-green-800 flex items-center gap-x-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="NIM">NIM</label>
              <Input type="text" id="NIM" value={student.NIM} disabled />
            </div>
            <div>
              <label htmlFor="nama_mahasiswa">Nama Mahasiswa</label>
              <Input type="text" id="nama_mahasiswa" value={student.nama_mahasiswa} disabled />
            </div>
            <div>
              <label htmlFor="semester">Semester</label>
              <Input
                type="number"
                id="semester"
                name="semester"
                value={student.semester}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="id_program_mbkm">Program MBKM</label>
              <select
                id="id_program_mbkm"
                name="id_program_mbkm"
                value={student.id_program_mbkm || ''}
                onChange={handleInputChange}
                className="h-9 w-full rounded-md border border-gray-300"
              >
                <option value="">Pilih Program</option>
                {programs.map((program) => (
                  <option key={program.id_program_mbkm} value={program.id_program_mbkm}>
                    {program.company} - {program.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="NIP_dosbing">Dosen Pembimbing</label>
              <select
                id="NIP_dosbing"
                name="NIP_dosbing"
                value={student.NIP_dosbing}
                onChange={handleInputChange}
                className="h-9 w-full rounded-md border border-gray-300"
              >
                <option value="">Pilih Dosen Pembimbing</option>
                {dosens.map((dosen) => (
                  <option key={dosen.NIP_dosbing} value={dosen.NIP_dosbing}>
                    {dosen.nama_dosbing}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-x-4">
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Simpan
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default EditMahasiswaPage;
