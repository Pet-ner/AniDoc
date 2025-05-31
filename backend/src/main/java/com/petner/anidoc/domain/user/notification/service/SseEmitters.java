package com.petner.anidoc.domain.user.notification.service;

import com.petner.anidoc.domain.user.notification.util.Ut;
import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.connector.ClientAbortException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Slf4j
public class SseEmitters {
    // Thread-safe한 Map<Long,List>를 사용하여 다중 클라이언트의 SSE 연결들을 관리
    final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();


    // 새로운 SSE 연결을 추가하고 관련 콜백을 설정하는 메서드
    public SseEmitter add(Long userId, SseEmitter emitter) {
        emitters.computeIfAbsent(userId, k-> new CopyOnWriteArrayList<>()).add(emitter);

        // 클라이언트와의 연결이 완료되면 컬렉션에서 제거하는 콜백
        emitter.onCompletion(() -> {
            List<SseEmitter> list = this.emitters.get(userId);
            if (list != null) list.remove(emitter);
        });

        // 연결이 타임아웃되면 완료 처리하는 콜백
        emitter.onTimeout(() -> {
            List<SseEmitter> list = this.emitters.get(userId);
            if (list != null) list.remove(emitter);
        });


        emitter.onError(e -> {
            List<SseEmitter> list = this.emitters.get(userId);
            if (list != null) list.remove(emitter);
        });

        return emitter;
    }


    // 데이터 없이 이벤트 이름만으로 알림을 보내는 간편 메서드
    public void noti(String eventName) {
        noti(eventName, Ut.mapOf()); // 빈 Map으로 알림 전송
    }

    // 모든 연결된 클라이언트들에게 이벤트를 전송하는 메서드
    public void noti(String eventName, Object data) {
        // 모든 emitter에 대해 반복하며 이벤트 전송
        emitters.forEach((userId, emitterList) -> {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : emitterList) {
                try {
                    emitter.send(
                            SseEmitter.event()
                                    .name(eventName)    // 이벤트 이름 설정
                                    .data(data)         // 전송할 데이터 설정
                    );
                } catch (ClientAbortException e) {
                    deadEmitters.add(emitter);
                    // 클라이언트가 연결을 강제로 종료한 경우 무시
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            emitterList.removeAll(deadEmitters);
        });
    }


    // 특정 사용자에게만 알림
    public void noti(Long userId, String eventName, Object data) {
        // userId의 SSE 연결 리스트 가져오기
        List<SseEmitter> userEmitters = emitters.get(userId);

        //해당하는 리스트의 emitter 에게 SSE방식으로 데이터 전송
        if(userEmitters != null){
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for(SseEmitter emitter : userEmitters){
                try{
                    emitter.send(
                            SseEmitter.event()
                                    .name(eventName)
                                    .data(data)
                    );
                }catch (ClientAbortException e){
                    deadEmitters.add(emitter);
                }catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            userEmitters.removeAll(deadEmitters);
        }
    }
}
