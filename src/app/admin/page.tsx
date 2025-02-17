import Card from '@/components/cards/Card';
import ContainerAdmin from '@/components/containers/ContainerAdmin';
import TableAdmin from './_section/TableAdmin';
import TableUMKM from './_section/TableUMKM';
import LoadingBar from '@/components/loading/LoadingBar';

export default function DashboardPage() {
    return (
        <ContainerAdmin>
            <LoadingBar />
            <Card>
                <h3 className="font-bold text-lg">Selamat Datang</h3>
                <p className="pt-2">
                    Selamat datang di dashboard admin untuk website Desa Karangbendo. Di
                    sini Anda dapat mengelola konten dan pengaturan website dengan mudah.
                    Pantau aktivitas terbaru, kelola artikel, gambar, dan informasi desa
                    dengan efisien untuk memastikan informasi terbaru selalu tersedia
                    untuk masyarakat.
                </p>
            </Card>
            <TableAdmin />
            <TableUMKM />
        </ContainerAdmin>
    );
}
