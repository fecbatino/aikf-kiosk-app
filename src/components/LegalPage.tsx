import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BackToHome from './BackToHome';
import type legal from '../locales/legal.json';
export default function LegalPage({ kind, embedded = false }: { kind: 'privacy' | 'imprint'; embedded?: boolean }) {
  const { t } = useTranslation();
  const content = t('content', { ns: 'legal', returnObjects: true }) as unknown as typeof legal.de;
  return <>
    {!embedded && <BackToHome />}
    <article className="legal-text">
      {!embedded && <Typography component="h1" variant="h4">{t(kind === 'privacy' ? 'footer_privacy' : 'footer_imprint')}</Typography>}
      {kind === 'privacy' ? content.privacy.map(([title, body]) => <section key={title}><Typography component={embedded ? 'h3' : 'h2'} variant="h6">{title}</Typography><Typography component="p">{body}</Typography></section>) : <>
        <section><Typography component="p"><strong>AIKF e.V. Nürnberg</strong><br />Al Rahama Moschee<br />Wölckernstraße 78<br />90459 Nürnberg<br />{content.country}</Typography></section>
        <section><Typography component={embedded ? 'h3' : 'h2'} variant="h6">{content.represented}</Typography><Typography component="p">{content.board}</Typography></section>
        <section><Typography component={embedded ? 'h3' : 'h2'} variant="h6">{content.contact}</Typography><Typography component="p"><a href="mailto:naikf2006@gmail.com">naikf2006@gmail.com</a></Typography></section>
        <section><Typography component={embedded ? 'h3' : 'h2'} variant="h6">{content.responsible}</Typography><Typography component="p">Fechal Batakpale<br />Wölckernstraße 78, 90459 Nürnberg</Typography></section>
      </>}
    </article>
  </>;
}
