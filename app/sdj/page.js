import Checkout from './Checkout';
import './sdj.css';
import {getSDJPlan} from '../../lib/sdj';
export const metadata = {title:'お申込み・お支払い｜SELF DISCOVERY JOURNEY',robots:{index:false,follow:false}};
export default async function Page({searchParams}) {
  const params = await searchParams;
  // Existing links without a plan retain the original PREMIUM selection.
  const plan = params.plan === undefined ? 'premium' : params.plan;
  if (!getSDJPlan(plan)) return <main className="sdj"><section className="card"><h1>プランを選んでください</h1><p>お申込み内容を確認してから、お進みください。</p><a className="button" href="/sdj?plan=basic">BASIC｜14,900円（税込）</a><a className="button secondary" href="/sdj?plan=premium">PREMIUM｜39,800円（税込）</a></section></main>;
  return <Checkout key={plan} initialPlan={plan}/>;
}
