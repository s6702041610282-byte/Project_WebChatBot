import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import QuestHeader from '../components/quest/QuestHeader';
import TownMap from '../components/quest/TownMap';
import QuestMap from '../components/quest/QuestMap';
import LearningSteps from '../components/quest/LearningSteps';
import MissionDetail from '../components/quest/MissionDetail';
import Robot from '../components/quest/art/Robot';
import { missions } from '../data/missions';
import { useAuth } from '../contexts/AuthContext';
import { getAllResults } from '../utils/quizStorage';
import { isUnlocked, passedCount, useProgress } from '../utils/progress';
import { journey } from '../utils/journey';

/** กิจกรรม — ลงมือปฏิบัติ: เมืองภารกิจ 3 สถานที่ */
export default function Worksheets() {
  const { user } = useAuth();
  const { progress } = useProgress(user?.uid);
  const j = journey(progress, getAllResults());
  const passed = passedCount(progress);

  const firstOpen = missions.findIndex((m) => !(progress.missions[m.id]?.stars > 0));
  const current = missions[firstOpen === -1 ? missions.length - 1 : firstOpen];
  const [selected, setSelected] = useState(current.id);
  const index = missions.findIndex((m) => m.id === selected);
  const m = missions[index];
  const cp = progress.missions[current.id] || {};
  const buildStep = passed === missions.length ? 5 : cp.attempts ? 3 : cp.design ? 2 : j.done.lessons ? 1 : 0;

  return (
    <div className="quest">
      <div className="qwrap">
        <QuestHeader
          progress={progress}
          stage={passed ? 3 : 1}
          title="กิจกรรม: ลงมือปฏิบัติสร้างแชตบอต"
          desc={`ผ่านแล้ว ${passed}/${missions.length} ภารกิจ · ตอบลูกค้าถูก ≥ 80% จึงผ่าน`}
        />

        {!j.can.practice && (
          <div className="practice__lock">
            <Robot head size={52} mood="think" />
            <div>
              <b>{j.done.pre ? `เรียนบทเรียนให้ครบ 6 พาร์ทก่อน (ผ่านแล้ว ${j.read}/6)` : 'เริ่มจากแบบทดสอบก่อนเรียนก่อนนะ'}</b>
              <p>ดูรายละเอียดภารกิจได้ แต่จะเริ่มทำได้เมื่อผ่านขั้นก่อนหน้า</p>
            </div>
            <Link to={j.done.pre ? '/content' : '/quizzes/pretest'} className="qbtn qbtn--primary qbtn--sm">
              {j.done.pre ? 'ไปที่บทเรียน' : 'ทำแบบทดสอบก่อนเรียน'} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* เมืองภารกิจ */}
        <section className="townwrap" aria-labelledby="town-title">
          <div className="townwrap__head">
            <h2 id="town-title">
              <MapPin size={18} aria-hidden="true" /> เมืองภารกิจ
            </h2>
            <p>แตะที่อาคารเพื่อดูโจทย์ · ผ่านภารกิจก่อนหน้าเพื่อปลดล็อกสถานที่ถัดไป</p>
          </div>
          <div className="townwrap__map">
            <TownMap missions={missions} progress={progress} selected={selected} onSelect={setSelected} practiceOpen={j.can.practice} />
          </div>
          <div className="townwrap__cards">
            <QuestMap missions={missions} progress={progress} selected={selected} onSelect={setSelected} />
          </div>
        </section>

        <MissionDetail
          wide
          mission={m}
          mp={progress.missions[m.id]}
          open={j.can.practice && isUnlocked(progress, index)}
          lockText={!j.can.practice ? (j.done.pre ? 'เรียนบทเรียนให้ครบ 6 พาร์ทก่อน' : 'ทำแบบทดสอบก่อนเรียนก่อน') : undefined}
        />

        <div className="ws-steps">
          <LearningSteps current={buildStep} />
        </div>

      </div>
    </div>
  );
}
