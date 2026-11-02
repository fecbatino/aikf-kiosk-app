import {act,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import App from '../App';
import {AuthProvider,useAuth} from '../contexts/AuthContext';
import {adminApi,donationsApi,paymentsApi} from '../api';
import legal from '../locales/legal.json';
const language=vi.hoisted(()=>({language:'de',changeLanguage:()=>Promise.resolve()}));
vi.mock('react-i18next',()=>({useTranslation:()=>({t:(key:string)=>key==='content' ? legal[language.language as keyof typeof legal] : key,i18n:language})}));
vi.mock('../ThemeWrapper',()=>({useThemeToggle:()=>({isDark:false,toggleTheme:vi.fn(),resetTheme:vi.fn()})}));
vi.mock('../config',()=>({default:{sepa:{bic:'SSKNDE77XXX',name:'Afrikanischen Islamischen Kultur Franken',iban:'DE79760501010005931811'},mosqueSepa:{bic:'SSKNDE77XXX',name:'Afrikanischen Islamischen Kultur Franken',iban:'DE48760501010015938889'}}}));
vi.mock('../api',()=>({adminApi:{login:vi.fn(),me:vi.fn()},donationsApi:{create:vi.fn()},paymentsApi:{config:vi.fn()},tokenStorage:{get:()=>sessionStorage.getItem('test-admin'),set:(t:string)=>sessionStorage.setItem('test-admin',t),remove:()=>sessionStorage.removeItem('test-admin')}}));
function FixtureLogin(){const auth=useAuth();return <button onClick={()=>auth.login('fixture@example.invalid','fixture')}>Fixture login</button>;}
beforeEach(()=>{language.language='de';sessionStorage.clear();vi.clearAllMocks();vi.mocked(paymentsApi.config).mockResolvedValue({online:false,terminal:false,paired:false,testMode:false,methods:[]});vi.mocked(donationsApi.create).mockImplementation(async(_body,key)=>({id:key,status:'pending'}));});
it('opens information above the donation without losing amount, step, or bank reference',async()=>{
 await act(async()=>{render(<MemoryRouter><AuthProvider><App/></AuthProvider></MemoryRouter>);});
 fireEvent.click(screen.getByRole('button',{name:'€20'}));await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'btn_next'}));});
 const reference=screen.getByText(/^Spende Allgemein - AIKF-/).textContent;
 fireEvent.click(screen.getByRole('link',{name:'footer_privacy'}));expect(screen.getByRole('dialog')).toBeInTheDocument();expect(screen.getByText('Datenschutz auf einen Blick')).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'close_information'}));
 await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());expect(screen.getByText(reference!)).toBeInTheDocument();expect(donationsApi.create).toHaveBeenCalledTimes(1);
});
it('logs the administrator out when returning to the public kiosk',async()=>{
 vi.mocked(adminApi.login).mockResolvedValue({token:'fixture-token',admin:{id:'1',email:'fixture@example.invalid'}});
 await act(async()=>{render(<MemoryRouter initialEntries={['/privacy']}><AuthProvider><FixtureLogin/><App/></AuthProvider></MemoryRouter>);});
 await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Fixture login'}));});
 expect(screen.getByRole('link',{name:'Spenden',exact:true})).toBeInTheDocument();
 await act(async()=>{fireEvent.click(screen.getByRole('link',{name:'Kiosk',exact:true}));});
 expect(screen.queryByRole('link',{name:'Spenden',exact:true})).not.toBeInTheDocument();expect(sessionStorage.getItem('test-admin')).toBeNull();
});
it('renders Arabic privacy headings and body rather than German text',async()=>{
 language.language='ar';
 await act(async()=>{render(<MemoryRouter initialEntries={['/privacy']}><AuthProvider><App/></AuthProvider></MemoryRouter>);});
 expect(screen.getByText('الخصوصية باختصار')).toBeInTheDocument();expect(screen.queryByText('Datenschutz auf einen Blick')).not.toBeInTheDocument();
});
