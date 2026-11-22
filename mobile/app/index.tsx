import { useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";

type Chat = { id: string; name: string; preview: string; time: string; unread?: number };
const sampleChats: Chat[] = [
  { id: "1", name: "Избранное", preview: "Личные заметки и файлы", time: "сейчас" },
  { id: "2", name: "Близкие ♡", preview: "Здесь появятся ваши сообщения", time: "вчера", unread: 2 },
  { id: "3", name: "Путешествия", preview: "Создайте первую группу", time: "пн" }
];

export default function Home() {
  const [tab, setTab] = useState("Все");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Chat | null>(null);
  const filtered = sampleChats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View><Text style={s.brand}>owwdy</Text><Text style={s.sub}>Общение. Без границ.</Text></View>
        <Pressable style={s.avatar}><Text style={s.avatarText}>✦</Text></Pressable>
      </View>
      {selected ? (
        <View style={s.chatPage}>
          <Pressable onPress={() => setSelected(null)}><Text style={s.back}>‹ Все чаты</Text></Pressable>
          <Text style={s.chatTitle}>{selected.name}</Text>
          <View style={s.empty}><Text style={s.emptyIcon}>✧</Text><Text style={s.emptyTitle}>Начните общение</Text><Text style={s.muted}>Сообщения появятся здесь после подключения сервера.</Text></View>
          <View style={s.composer}><TextInput style={s.messageInput} placeholder="Написать сообщение…" placeholderTextColor="#9993AA" editable={false}/><Text style={s.send}>➤</Text></View>
        </View>
      ) : (
        <>
          <Text style={s.heading}>Чаты</Text>
          <TextInput value={query} onChangeText={setQuery} placeholder="Поиск по чатам" placeholderTextColor="#9993AA" style={s.search}/>
          <View style={s.filters}>{["Все","Личные","Группы","Каналы"].map(x => <Pressable key={x} onPress={() => setTab(x)} style={[s.chip,tab===x&&s.chipActive]}><Text style={[s.chipText,tab===x&&s.chipTextActive]}>{x}</Text></Pressable>)}</View>
          <FlatList data={filtered} keyExtractor={x=>x.id} contentContainerStyle={{paddingBottom:24}} renderItem={({item}) => <Pressable onPress={()=>setSelected(item)} style={s.chatRow}><View style={s.chatAvatar}><Text style={s.avatarText}>✦</Text></View><View style={s.chatInfo}><Text style={s.chatName}>{item.name}</Text><Text style={s.preview}>{item.preview}</Text></View><View style={s.chatMeta}><Text style={s.time}>{item.time}</Text>{item.unread ? <Text style={s.unread}>{item.unread}</Text> : null}</View></Pressable>}/>
          <View style={s.nav}>{["Чаты","Звонки","Контакты","Профиль"].map((x,i)=><Pressable key={x} style={s.navItem}><Text style={[s.navIcon,i===0&&s.navSelected]}>{["▤","◉","♡","◌"][i]}</Text><Text style={[s.navLabel,i===0&&s.navSelected]}>{x}</Text></Pressable>)}</View>
          <Text style={s.notice}>Предварительная оболочка · сервер и шифрование ещё не подключены</Text>
        </>
      )}
    </SafeAreaView>
  );
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#100D18",paddingHorizontal:22,paddingTop:18},
 header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:28},
 brand:{color:"#F8F3FF",fontSize:32,fontWeight:"800",letterSpacing:-1.4},
 sub:{color:"#A99ABF",fontSize:12,marginTop:2},
 avatar:{width:42,height:42,borderRadius:15,backgroundColor:"#30213F",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#7751A3"},
 avatarText:{color:"#E5B8FF",fontSize:21},
 heading:{color:"#FBF7FF",fontSize:27,fontWeight:"700",marginBottom:15},
 search:{backgroundColor:"#211A2B",borderRadius:16,paddingHorizontal:16,paddingVertical:14,color:"#FFF",fontSize:15,marginBottom:15,borderWidth:1,borderColor:"#342840"},
 filters:{flexDirection:"row",gap:8,marginBottom:18},
 chip:{paddingVertical:9,paddingHorizontal:15,borderRadius:20,backgroundColor:"#211A2B"},
 chipActive:{backgroundColor:"#7950A7"},
 chipText:{color:"#B9ACC9",fontSize:13,fontWeight:"600"},
 chipTextActive:{color:"#FFF"},
 chatRow:{flexDirection:"row",alignItems:"center",paddingVertical:14,borderBottomWidth:1,borderBottomColor:"#251E30",gap:12},
 chatAvatar:{width:52,height:52,borderRadius:19,backgroundColor:"#342444",alignItems:"center",justifyContent:"center"},
 chatInfo:{flex:1},
 chatName:{color:"#F7F1FF",fontSize:16,fontWeight:"700",marginBottom:5},
 preview:{color:"#A99EB5",fontSize:13},
 chatMeta:{alignItems:"flex-end",gap:8},
 time:{color:"#8D819B",fontSize:11},
 unread:{overflow:"hidden",backgroundColor:"#A56BE1",color:"#FFF",fontSize:11,fontWeight:"700",paddingHorizontal:7,paddingVertical:3,borderRadius:10},
 nav:{flexDirection:"row",justifyContent:"space-around",paddingTop:14,paddingBottom:12,borderTopWidth:1,borderTopColor:"#2A2134"},
 navItem:{alignItems:"center",gap:4},
 navIcon:{fontSize:21,color:"#82768F"},
 navSelected:{color:"#D8A5FF"},
 navLabel:{fontSize:10,color:"#8E829B"},
 notice:{textAlign:"center",fontSize:10,color:"#766A82",paddingBottom:8},
 chatPage:{flex:1},
 back:{color:"#D4A7F7",fontSize:15,marginBottom:28},
 chatTitle:{color:"#FFF",fontSize:24,fontWeight:"700"},
 empty:{flex:1,alignItems:"center",justifyContent:"center",paddingHorizontal:30},
 emptyIcon:{fontSize:48,color:"#B987E8",marginBottom:12},
 emptyTitle:{color:"#FFF",fontSize:18,fontWeight:"700",marginBottom:8},
 muted:{color:"#A99EB5",fontSize:13,textAlign:"center",lineHeight:20},
 composer:{flexDirection:"row",alignItems:"center",backgroundColor:"#211A2B",borderRadius:18,paddingHorizontal:15,paddingVertical:8,marginBottom:18},
 messageInput:{flex:1,color:"#FFF",paddingVertical:8},
 send:{color:"#D6A5FF",fontSize:22,padding:6}
});