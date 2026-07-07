const questions = [
  {
    text: "当你发现有人在背后议论你，你的第一反应是？",
    options: [
      { text: "不在意，他们说他们的", type: "joker" },
      { text: "想知道他们为什么这么说", type: "anton" },
      { text: "表面无所谓，心里记下来了", type: "tbag" },
      { text: "当面戳穿，让他们闭嘴", type: "tyler" }
    ]
  },
  {
    text: "如果你被迫进入一场混乱的局面，你会怎么做？",
    options: [
      { text: "顺着混乱玩下去", type: "joker" },
      { text: "先观察规则，再找出口", type: "anton" },
      { text: "利用别人之间的矛盾", type: "tbag" },
      { text: "直接推翻原来的秩序", type: "tyler" }
    ]
  },
  {
    text: "你最无法忍受哪一种感觉？",
    options: [
      { text: "被所有人忽视", type: "joker" },
      { text: "事情失去控制", type: "anton" },
      { text: "被困在弱者位置", type: "tbag" },
      { text: "被虚伪规则束缚", type: "tyler" }
    ]
  }
];

const results = {
  joker: {
    name: "小丑型反派",
    desc: "你内心有一种强烈的戏剧感。越是在被忽视、误解和压抑的时候，你越容易用夸张、反讽和破坏感来夺回存在感。"
  },
  anton: {
    name: "冷酷审判者",
    desc: "你相信规则、代价和秩序。你不一定情绪外露，但你会用极强的判断力和边界感，冷静地处理一切混乱。"
  },
  tbag: {
    name: "危险生存家",
    desc: "你擅长在复杂关系里寻找缝隙。你很会观察人性，也知道如何在不利局面中为自己争取空间。"
  },
  tyler: {
    name: "秩序破坏者",
    desc: "你讨厌虚假的稳定和被规定好的人生。你更愿意打碎旧规则，哪怕方式激烈，也要重新证明自己还活着。"
  }
};