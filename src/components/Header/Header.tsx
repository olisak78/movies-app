import './Header.css';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  return <div className='header-container'>{title}</div>;
};
export default Header;
