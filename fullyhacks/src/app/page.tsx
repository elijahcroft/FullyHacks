import PathPage from '../app/components/PathPage';
import SideBar from '../app/components/SideBar'

export default function Home() {
  return (
    <div>
      <PathPage width={800} height={500}/>
      <SideBar />
    </div>
    );
}
