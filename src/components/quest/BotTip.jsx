import Robot from './art/Robot';

/** คำแนะนำจากมาสคอต “บิท” */
export default function BotTip({ children, mood = 'happy', title = 'บิทแนะนำ' }) {
  return (
    <div className="bottip">
      <Robot head size={40} mood={mood} />
      <div className="bottip__bubble">
        <b>{title}</b>
        <div>{children}</div>
      </div>
    </div>
  );
}
